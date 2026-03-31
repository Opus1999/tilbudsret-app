export interface RecipeIngredient {
  id: string;
  name: string;
  amountPerServing: number;
  unit: string;
  price: number; // total price for base serving amount
  store: string;
}

export interface RecipeStep {
  number: number;
  title: string;
  description: string;
  durationMinutes?: number;
}

export interface Recipe {
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
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Spaghetti Bolognese',
    description: 'Klassisk italiensk pastaret med mørt hakket oksekød i en dyb tomatsovs med friske urter.',
    emoji: '🍝',
    heroColor: '#C0392B',
    heroSecondaryColor: '#E74C3C',
    prepMinutes: 15,
    cookMinutes: 35,
    difficulty: 'Let',
    baseServings: 4,
    tag: 'Ugens bedste køb',
    pricePerPerson: 18,
    originalPricePerPerson: 28,
    ingredients: [
      { id: 'b1', name: 'Hakket oksekød 8-12%', amountPerServing: 125, unit: 'g', price: 29.95, store: 'Netto' },
      { id: 'b2', name: 'Spaghetti', amountPerServing: 100, unit: 'g', price: 8.95, store: 'Netto' },
      { id: 'b3', name: 'Hakkede tomater', amountPerServing: 0.5, unit: 'dåse', price: 11.90, store: 'Netto' },
      { id: 'b4', name: 'Løg', amountPerServing: 0.5, unit: 'stk.', price: 4.50, store: 'Netto' },
      { id: 'b5', name: 'Hvidløg', amountPerServing: 0.5, unit: 'fed', price: 3.95, store: 'Netto' },
      { id: 'b6', name: 'Tomatpuré', amountPerServing: 0.5, unit: 'spsk.', price: 5.95, store: 'Netto' },
      { id: 'b7', name: 'Olivenolie', amountPerServing: 0.5, unit: 'spsk.', price: 29.95, store: 'Rema 1000' },
      { id: 'b8', name: 'Parmesan, revet', amountPerServing: 25, unit: 'g', price: 16.95, store: 'Rema 1000' },
      { id: 'b9', name: 'Salt & peber', amountPerServing: 1, unit: 'knivspids', price: 0, store: '' },
    ],
    steps: [
      {
        number: 1,
        title: 'Forbered grøntsagerne',
        description: 'Pil og hak løget fint. Pres hvidløgsfeddene. Varm olivenolie op i en stor gryde ved middel varme.',
        durationMinutes: 5,
      },
      {
        number: 2,
        title: 'Svits løg og hvidløg',
        description: 'Steg løg og hvidløg i oliven olien i ca. 3-4 minutter, til løgene er klare og bløde. Pas på de ikke branker.',
        durationMinutes: 4,
      },
      {
        number: 3,
        title: 'Brun kødet',
        description: 'Tilsæt det hakkede oksekød og brun det godt ved høj varme. Brug en ske til at bryde kødet op i små stykker. Steg til al væsken er fordampet og kødet er brunet.',
        durationMinutes: 8,
      },
      {
        number: 4,
        title: 'Tilsæt tomater og simr',
        description: 'Rør tomatpuré i og steg et minut. Tilsæt de hakkede tomater, og krydr med salt og peber. Skru ned til lav varme og lad sovsen simre i mindst 25 minutter.',
        durationMinutes: 25,
      },
      {
        number: 5,
        title: 'Kog pastaen',
        description: 'Kog en stor gryde vand op med rigeligt salt. Kog spaghettien efter pakkens anvisning — typisk 8-10 minutter for al dente. Gem lidt pastavand inden du hælder det fra.',
        durationMinutes: 10,
      },
      {
        number: 6,
        title: 'Anret og servér',
        description: 'Bland pasta og kødsovs, eller server sovsen oven på. Tilsæt en smule pastavand hvis sovsen er for tyk. Riv frisk parmesan over og servér straks.',
        durationMinutes: 2,
      },
    ],
  },
  {
    id: '2',
    name: 'Kylling med rodfrugter',
    description: 'Saftig ovnkylling med sæsonens rodfrugter, frisk rosmarin og et sprødt skind der knaser.',
    emoji: '🍗',
    heroColor: '#D4A017',
    heroSecondaryColor: '#E8B84B',
    prepMinutes: 20,
    cookMinutes: 60,
    difficulty: 'Mellem',
    baseServings: 4,
    tag: 'Populær',
    pricePerPerson: 24,
    originalPricePerPerson: 38,
    ingredients: [
      { id: 'k1', name: 'Hel kylling', amountPerServing: 0.35, unit: 'kg', price: 49.95, store: 'Rema 1000' },
      { id: 'k2', name: 'Rodfrugter (blanding)', amountPerServing: 187, unit: 'g', price: 14.95, store: 'Lidl' },
      { id: 'k3', name: 'Hvidløg', amountPerServing: 0.5, unit: 'fed', price: 3.95, store: 'Netto' },
      { id: 'k4', name: 'Rosmarin, frisk', amountPerServing: 0.25, unit: 'bundt', price: 7.95, store: 'Rema 1000' },
      { id: 'k5', name: 'Olivenolie', amountPerServing: 1, unit: 'spsk.', price: 29.95, store: 'Rema 1000' },
      { id: 'k6', name: 'Smør', amountPerServing: 15, unit: 'g', price: 12.95, store: 'Netto' },
      { id: 'k7', name: 'Citron', amountPerServing: 0.25, unit: 'stk.', price: 3.50, store: 'Lidl' },
      { id: 'k8', name: 'Salt & peber', amountPerServing: 1, unit: 'knivspids', price: 0, store: '' },
    ],
    steps: [
      {
        number: 1,
        title: 'Forvarm ovnen',
        description: 'Forvarm ovnen til 200°C (varmluft 180°C). Tag kyllingen ud af køleskabet 30 minutter inden tilberedning så den er tempereret.',
        durationMinutes: 5,
      },
      {
        number: 2,
        title: 'Forbered kyllingen',
        description: 'Dup kyllingen tør med køkkenrulle — det er afgørende for sprødt skind. Gnid den ind og ud med blødt smør, salt og peber. Stik rosmarinkviste og halverede hvidløgsfed ind under skindet på brystet.',
        durationMinutes: 10,
      },
      {
        number: 3,
        title: 'Skær rodfrugterne',
        description: 'Skræl og skær gulerødder, pastinakker og kartofler i grove stykker á ca. 3 cm. Vend dem med olivenolie, salt, peber og frisk rosmarin i et ildfast fad.',
        durationMinutes: 10,
      },
      {
        number: 4,
        title: 'Steg kyllingen',
        description: 'Placer kyllingen oven på rodfrugterne med brystsiden opad. Pres citronsaft over og læg de tomme citronhalvdele i fadet. Sæt i ovnen og steg i 55-65 minutter, til kyllingesaften løber klar.',
        durationMinutes: 60,
      },
      {
        number: 5,
        title: 'Hvil og servér',
        description: 'Tag kyllingen ud og lad den hvile tildækket med folie i 10 minutter — dette gør kødet ekstra saftigt. Del kyllingen op og servér med de stegte rodfrugter og evt. en grøn salat.',
        durationMinutes: 10,
      },
    ],
  },
  {
    id: '3',
    name: 'Laksepasta med fløde',
    description: 'Cremet, hurtig hverdagspasta med røget laks, frisk dild og et hint af citron der løfter hele retten.',
    emoji: '🐟',
    heroColor: '#1A6B8A',
    heroSecondaryColor: '#2E86AB',
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: 'Let',
    baseServings: 2,
    tag: 'Hurtigt & nemt',
    pricePerPerson: 27,
    originalPricePerPerson: 42,
    ingredients: [
      { id: 'l1', name: 'Røget laks', amountPerServing: 100, unit: 'g', price: 24.95, store: 'Lidl' },
      { id: 'l2', name: 'Pastanudler brede', amountPerServing: 125, unit: 'g', price: 7.95, store: 'Netto' },
      { id: 'l3', name: 'Piskefløde 38%', amountPerServing: 100, unit: 'ml', price: 9.95, store: 'Lidl' },
      { id: 'l4', name: 'Citron', amountPerServing: 0.5, unit: 'stk.', price: 3.50, store: 'Lidl' },
      { id: 'l5', name: 'Frisk dild', amountPerServing: 0.25, unit: 'bundt', price: 6.95, store: 'Lidl' },
      { id: 'l6', name: 'Kapers', amountPerServing: 1, unit: 'spsk.', price: 14.95, store: 'Netto' },
      { id: 'l7', name: 'Parmesan, revet', amountPerServing: 20, unit: 'g', price: 16.95, store: 'Rema 1000' },
      { id: 'l8', name: 'Salt & peber', amountPerServing: 1, unit: 'knivspids', price: 0, store: '' },
    ],
    steps: [
      {
        number: 1,
        title: 'Kog pastaen',
        description: 'Kog en gryde letsaltet vand op. Kog pastaen al dente efter pakkens anvisning. Gem 1 dl pastavand inden du hælder fra.',
        durationMinutes: 10,
      },
      {
        number: 2,
        title: 'Lav flødesovsen',
        description: 'Varm en pande op ved middel varme. Hæld fløden på og lad den reducere let i 3-4 minutter til den tykner en smule. Riv citronskal i og pres lidt citronsaft i.',
        durationMinutes: 5,
      },
      {
        number: 3,
        title: 'Tilsæt laksen',
        description: 'Riv den røgede laks i grove stykker og vend dem i flødesovsen. Varm forsigtigt igennem i 1-2 minutter — undgå at overvarm laksen, den må ikke blive tør.',
        durationMinutes: 2,
      },
      {
        number: 4,
        title: 'Bland og anret',
        description: 'Vend den varme pasta i sovsen. Tilsæt lidt pastavand hvis sovsen er for tyk. Smag til med salt, peber og citronsaft. Anret i skåle og top med frisk dild, kapers og revet parmesan.',
        durationMinutes: 2,
      },
    ],
  },
];

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function formatAmount(amount: number, unit: string, servings: number, baseServings: number): string {
  const scaled = (amount * servings) / baseServings;
  const rounded = scaled < 1
    ? Math.round(scaled * 4) / 4  // round to nearest 0.25 for small amounts
    : Math.round(scaled * 2) / 2; // round to nearest 0.5 for larger amounts

  const display = rounded % 1 === 0 ? String(rounded) : String(rounded).replace('.', ',');
  return `${display} ${unit}`;
}

export function getScaledPrice(price: number, servings: number, baseServings: number): number {
  return (price * servings) / baseServings;
}
