/**
 * AI recipe generation using Claude.
 * Combines current supermarket offers into complete dinner recipes.
 */
import Anthropic from '@anthropic-ai/sdk';
import { Offer } from '../types';
import { logger } from '../logger';

// Matches the app's Recipe / RecipeIngredient / RecipeStep interfaces exactly
export interface GeneratedIngredient {
  id: string;
  name: string;
  amountPerServing: number;
  unit: string;
  price: number;
  store: string;
}

export interface GeneratedStep {
  number: number;
  title: string;
  description: string;
  durationMinutes?: number;
}

export interface GeneratedRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  heroColor: string;
  heroSecondaryColor: string;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: 'Let' | 'Mellem' | 'Svær';
  baseServings: number;
  tag: string;
  pricePerPerson: number;
  originalPricePerPerson: number;
  ingredients: GeneratedIngredient[];
  steps: GeneratedStep[];
}

const STORE_DISPLAY: Record<string, string> = {
  netto: 'Netto',
  bilka: 'Bilka',
  foetex: 'Føtex',
  rema1000: 'Rema 1000',
  lidl: 'Lidl',
};

export async function generateRecipes(offers: Offer[]): Promise<GeneratedRecipe[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY mangler i .env');

  const client = new Anthropic({ apiKey });

  // Only use Netto, Bilka, Føtex — filter out zero-price and staples
  const relevant = offers
    .filter((o) => ['netto', 'bilka', 'foetex'].includes(o.store))
    .filter((o) => o.price > 0 && o.name.length > 2)
    .slice(0, 80);

  if (relevant.length === 0) throw new Error('Ingen tilbud fra Netto/Bilka/Føtex at generere opskrifter fra');

  const offerList = relevant
    .map((o) => {
      const store = STORE_DISPLAY[o.store] ?? o.store;
      const orig = o.originalPrice ? ` [normalt ${o.originalPrice} kr]` : '';
      return `- ${store}: ${o.name} · ${o.price} kr/${o.unit}${orig}`;
    })
    .join('\n');

  const prompt = `Du er en dansk madekspert der genererer ugentlige madplaner baseret på supermarkedstilbud.

Denne uges tilbud fra Netto, Bilka og Føtex:
${offerList}

Generer 3 varierede og lækre middagsopskrifter der bruger disse tilbudsvarer.

Krav:
- Opskrifterne skal være til 4 personer (baseServings: 4)
- Brug mindst 2-3 tilbudsvarer som hoved-ingredienser i hver opskrift
- Variér: fx én med kød, én med fisk/fjerkræ, én vegetarisk/pasta
- Inkludér basis-ingredienser (løg, hvidløg, salt, peber, olie, smør) med price: 0 og store: ""
- Trin-for-trin instruktioner på dansk med realistiske tidsvurderinger

Svar KUN med valid JSON — ingen markdown, ingen forklaring, ingen kommentarer:
{
  "recipes": [
    {
      "id": "1",
      "name": "Rettens navn på dansk",
      "description": "Kort appetitlig beskrivelse (1-2 sætninger på dansk)",
      "emoji": "🍽️",
      "heroColor": "#C0392B",
      "heroSecondaryColor": "#E74C3C",
      "prepMinutes": 15,
      "cookMinutes": 30,
      "difficulty": "Let",
      "baseServings": 4,
      "tag": "Ugens bedste køb",
      "pricePerPerson": 22,
      "originalPricePerPerson": 35,
      "ingredients": [
        {
          "id": "i1",
          "name": "Ingrediensnavn",
          "amountPerServing": 125,
          "unit": "g",
          "price": 29.95,
          "store": "Netto"
        }
      ],
      "steps": [
        {
          "number": 1,
          "title": "Kort trintitel",
          "description": "Detaljeret beskrivelse af hvad man gør i dette trin.",
          "durationMinutes": 5
        }
      ]
    }
  ]
}

Prisregler:
- pricePerPerson = total ingredienspris for 4 pers. divideret med 4 (afrund til nærmeste hele tal)
- originalPricePerPerson = hvad det ville koste uden tilbud (brug originalPrice fra tilbuddene, ellers +40%)
- Basis-ingredienser (salt, peber, olie, vand): price: 0, store: ""

heroColor baseret på ret:
- Oksekød/lam: "#C0392B"
- Kylling/fjerkræ: "#D4A017"
- Fisk/skaldyr: "#1A6B8A"
- Vegetar/pasta: "#2D6A4F"
- Svinekød: "#8B4513"

heroSecondaryColor: lysere variant af heroColor

tag — vælg én: "Ugens bedste køb" | "Populær" | "Hurtigt & nemt" | "Sund & nem" | "Familievenlig"
difficulty — vælg én: "Let" | "Mellem" | "Svær"`;

  logger.info('[AI] Kalder Claude for at generere opskrifter fra tilbud...');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(clean) as { recipes: GeneratedRecipe[] };
    const result = parsed.recipes ?? [];
    logger.ok(`[AI] Genererede ${result.length} opskrifter`);
    return result;
  } catch (e) {
    logger.error('[AI] Kunne ikke parse AI-svar som JSON');
    logger.error(`[AI] Svar (første 300 tegn): ${text.slice(0, 300)}`);
    throw new Error('Ugyldigt JSON-svar fra Claude');
  }
}
