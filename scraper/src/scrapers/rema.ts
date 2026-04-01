/**
 * Rema 1000 scraper.
 *
 * Bruger Rema's interne kampagne-API som deres hjemmeside kalder.
 * Endpoint: https://cphapp.rema.dk/api/v2/leaflet/public/preview
 *
 * Falder tilbage til HTML-scraping af tilbud.rema.dk hvis API'et ændres.
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { Offer, ScraperResult } from '../types';
import { logger } from '../logger';

const STORE = 'rema1000' as const;

function id(name: string, price: number): string {
  return crypto.createHash('md5').update(`rema:${name}:${price}`).digest('hex').slice(0, 12);
}

function weekBounds() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
}

async function fetchViaApi(): Promise<Offer[]> {
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();

  const { data } = await axios.get('https://cphapp.rema.dk/api/v2/leaflet/public/preview', {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    timeout: 12000,
  });

  const items: any[] = data?.items ?? data?.offers ?? [];
  return items.map((item: any) => ({
    id: id(item.name ?? '', item.price ?? 0),
    store: STORE,
    name: item.name ?? item.title ?? 'Ukendt vare',
    description: item.description ?? item.subtitle ?? '',
    price: parseFloat(item.price ?? item.discountPrice ?? 0),
    originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
    unit: item.unit ?? item.unitSize ?? 'stk.',
    category: item.category ?? 'Andet',
    validFrom: item.validFrom ?? from,
    validTo: item.validTo ?? to,
    imageUrl: item.image ?? item.imageUrl ?? null,
    scrapedAt,
  }));
}

async function fetchViaHtml(): Promise<Offer[]> {
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();

  const { data: html } = await axios.get('https://tilbud.rema.dk', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TilbudsretBot/1.0)' },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const offers: Offer[] = [];

  // Rema tilbuds-sider bruger .product-tile eller lignende klasser
  $('[class*="product"], [class*="offer"], [class*="tile"]').each((_, el) => {
    const name = $(el).find('[class*="name"], [class*="title"], h3, h4').first().text().trim();
    const priceText = $(el).find('[class*="price"]').first().text().trim();
    const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    if (!name || price === 0) return;

    offers.push({
      id: id(name, price),
      store: STORE,
      name,
      description: $(el).find('[class*="desc"]').first().text().trim(),
      price,
      originalPrice: null,
      unit: 'stk.',
      category: 'Andet',
      validFrom: from,
      validTo: to,
      imageUrl: $(el).find('img').attr('src') ?? null,
      scrapedAt,
    });
  });

  return offers;
}

export async function scrapeRema(): Promise<ScraperResult> {
  const start = Date.now();
  logger.info(`[${STORE}] Henter tilbud...`);

  try {
    let offers: Offer[];
    try {
      offers = await fetchViaApi();
      logger.ok(`[${STORE}] API: ${offers.length} tilbud`);
    } catch {
      logger.warn(`[${STORE}] API fejlede — prøver HTML scraping...`);
      offers = await fetchViaHtml();
      logger.ok(`[${STORE}] HTML: ${offers.length} tilbud`);
    }

    return { store: STORE, offers, fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: null };
  } catch (err: any) {
    const msg = err?.response?.status ? `HTTP ${err.response.status}` : err.message;
    logger.error(`[${STORE}] ${msg}`);
    return { store: STORE, offers: [], fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: msg };
  }
}
