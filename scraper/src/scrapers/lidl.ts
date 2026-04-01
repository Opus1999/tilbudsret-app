/**
 * Lidl Denmark scraper.
 *
 * Lidl eksponerer tilbudsdata via en intern JSON endpoint som
 * deres hjemmeside bruger til at rendere ugenstilbud.
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { Offer, ScraperResult } from '../types';
import { logger } from '../logger';

const STORE = 'lidl' as const;

function id(name: string, price: number): string {
  return crypto.createHash('md5').update(`lidl:${name}:${price}`).digest('hex').slice(0, 12);
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

  // Lidl's locale-aware JSON endpoint for DK
  const { data } = await axios.get('https://www.lidl.dk/api/grid-data/weekly-theme-start', {
    params: { locale: 'da_DK' },
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    timeout: 12000,
  });

  const grid = data?.gridData ?? data?.items ?? [];

  return (grid as any[])
    .filter((item: any) => item.price || item.offerPrice)
    .map((item: any) => ({
      id: id(item.name ?? item.title ?? '', item.price ?? item.offerPrice ?? 0),
      store: STORE,
      name: item.name ?? item.title ?? 'Ukendt vare',
      description: item.description ?? '',
      price: parseFloat(item.price ?? item.offerPrice ?? 0),
      originalPrice: item.normalPrice ? parseFloat(item.normalPrice) : null,
      unit: item.unit ?? item.pieceCount ?? 'stk.',
      category: item.category ?? 'Andet',
      validFrom: item.startDate ?? from,
      validTo: item.endDate ?? to,
      imageUrl: item.imageUrl ?? item.image ?? null,
      scrapedAt,
    }));
}

async function fetchViaHtml(): Promise<Offer[]> {
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();

  const { data: html } = await axios.get('https://www.lidl.dk/c/ugenstilbud/a10026057', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TilbudsretBot/1.0)' },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const offers: Offer[] = [];

  $('.offer-item, .product-grid-box, [class*="offer"]').each((_, el) => {
    const name = $(el).find('[class*="title"], [class*="name"], h3').first().text().trim();
    const priceRaw = $(el).find('[class*="price__value"], [class*="price"]').first().text().trim();
    const price = parseFloat(priceRaw.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    if (!name || price === 0) return;

    const origRaw = $(el).find('[class*="strike"], [class*="original"]').first().text().trim();
    const originalPrice = parseFloat(origRaw.replace(/[^0-9,]/g, '').replace(',', '.')) || null;

    offers.push({
      id: id(name, price),
      store: STORE,
      name,
      description: $(el).find('[class*="desc"]').first().text().trim(),
      price,
      originalPrice,
      unit: $(el).find('[class*="unit"]').first().text().trim() || 'stk.',
      category: 'Andet',
      validFrom: from,
      validTo: to,
      imageUrl: $(el).find('img').attr('src') ?? null,
      scrapedAt,
    });
  });

  return offers;
}

export async function scrapeLidl(): Promise<ScraperResult> {
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
