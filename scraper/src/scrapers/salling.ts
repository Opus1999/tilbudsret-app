/**
 * Salling Group scraper — dækker Netto, Bilka og Føtex.
 *
 * Salling Group har en gratis offentlig developer API:
 *   https://developer.sallinggroup.com
 *
 * Hent en gratis API-nøgle og sæt den i .env:
 *   SALLING_API_KEY=din-nøgle-her
 *
 * Uden nøgle bruges demo-data så resten af pipelinen kan testes.
 */
import axios from 'axios';
import crypto from 'crypto';
import { Offer, ScraperResult, Store } from '../types';
import { logger } from '../logger';

const BASE_URL = 'https://api.sallinggroup.com/v2';
const API_KEY = process.env.SALLING_API_KEY ?? '';

// Brand → Salling store-type mapping
const BRAND_MAP: Record<Store, string> = {
  netto:   'netto',
  bilka:   'bilka',
  foetex:  'foetex',
  rema1000: '',
  lidl:    '',
};

function id(store: string, name: string, price: number): string {
  return crypto.createHash('md5').update(`${store}:${name}:${price}`).digest('hex').slice(0, 12);
}

function weekBounds(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
  };
}

async function fetchSallingOffers(store: Store): Promise<Offer[]> {
  const brand = BRAND_MAP[store];
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();

  const url = `${BASE_URL}/offers`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    params: { brand, startDate: from, endDate: to, limit: 100 },
    timeout: 10000,
  });

  return (data as any[]).map((item: any) => ({
    id: id(store, item.heading ?? '', item.price?.price ?? 0),
    store,
    name: item.heading ?? 'Ukendt vare',
    description: item.description ?? '',
    price: item.price?.price ?? 0,
    originalPrice: item.price?.originalPrice ?? null,
    unit: item.price?.unitSize ?? 'stk.',
    category: item.category ?? 'Andet',
    validFrom: item.startDate ?? from,
    validTo: item.endDate ?? to,
    imageUrl: item.image ?? null,
    scrapedAt,
  }));
}

// Demo-data bruges når der ikke er en API-nøgle
function demoOffers(store: Store): Offer[] {
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();
  const label = store === 'netto' ? 'Netto' : store === 'bilka' ? 'Bilka' : 'Føtex';

  return [
    { id: id(store, 'Hakket oksekød', 29.95), store, name: 'Hakket oksekød 500g', description: '8-12% fedt', price: 29.95, originalPrice: 39.95, unit: '500 g', category: 'Kød', validFrom: from, validTo: to, imageUrl: null, scrapedAt },
    { id: id(store, 'Mælk', 8.95),            store, name: `${label} Minimælk 1L`, description: '0,5% fedt', price: 8.95,  originalPrice: 10.95, unit: '1 L',   category: 'Mejeri', validFrom: from, validTo: to, imageUrl: null, scrapedAt },
    { id: id(store, 'Æbler', 19.95),           store, name: 'Æbler 1 kg',          description: 'Gala eller Pink Lady', price: 19.95, originalPrice: 29.95, unit: '1 kg', category: 'Frugt & grønt', validFrom: from, validTo: to, imageUrl: null, scrapedAt },
  ];
}

export async function scrapeStore(store: Store): Promise<ScraperResult> {
  const start = Date.now();
  logger.info(`[${store}] Henter tilbud...`);

  try {
    let offers: Offer[];

    if (!API_KEY) {
      logger.warn(`[${store}] Ingen SALLING_API_KEY — bruger demo-data. Sæt nøglen i scraper/.env`);
      offers = demoOffers(store);
    } else {
      offers = await fetchSallingOffers(store);
    }

    logger.ok(`[${store}] ${offers.length} tilbud hentet`);
    return { store, offers, fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: null };
  } catch (err: any) {
    const msg = err?.response?.status
      ? `HTTP ${err.response.status}: ${err.response.statusText}`
      : err.message;
    logger.error(`[${store}] ${msg}`);
    return { store, offers: [], fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: msg };
  }
}
