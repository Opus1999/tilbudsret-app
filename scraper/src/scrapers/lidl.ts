/**
 * Lidl Denmark scraper.
 *
 * Primær: Lidl's interne JSON endpoint
 * Fallback: HTML-scraping af lidl.dk/c/tilbudsavis/s10013730
 *
 * Korrekte URLs verificeret 2026-03-31:
 *   - Tilbudsavis: https://www.lidl.dk/c/tilbudsavis/s10013730
 *   - ODS komponent-bibliotek klasser: .ods-tile, .ods-price
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { Offer, ScraperResult } from '../types';
import { logger } from '../logger';

const STORE = 'lidl' as const;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
  'Accept-Language': 'da-DK,da;q=0.9',
};

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
    headers: HEADERS,
    timeout: 12000,
  });

  const grid = data?.gridData ?? data?.items ?? data ?? [];
  if (!Array.isArray(grid) || grid.length === 0) throw new Error('Tom respons fra API');

  return (grid as any[])
    .filter((item: any) => item.price || item.offerPrice)
    .map((item: any) => ({
      id: id(item.name ?? item.title ?? '', Number(item.price ?? item.offerPrice ?? 0)),
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

  // Korrekt URL verificeret: lidl.dk/c/tilbudsavis/s10013730
  const { data: html } = await axios.get('https://www.lidl.dk/c/tilbudsavis/s10013730', {
    headers: { ...HEADERS, Accept: 'text/html' },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const offers: Offer[] = [];

  // Lidl bruger ODS (Own Design System) komponent-bibliotek
  // Primære selektorer baseret på ODS klasser
  const selectors = [
    '.ods-tile',
    '[class*="ods-tile"]',
    '.product-grid-box',
    '[class*="offer-item"]',
    'article',
  ];

  $(selectors.join(', ')).each((_, el) => {
    const name = $(el)
      .find('[class*="title"], [class*="name"], [class*="heading"], h3, h4')
      .first().text().trim();

    // ODS pris-element: .ods-price eller [class*="price"]
    const priceText = $(el)
      .find('.ods-price, [class*="ods-price"], [class*="price__value"], [class*="price"]')
      .first().text().trim();
    const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

    if (!name || price === 0) return;

    const origText = $(el)
      .find('[class*="strike"], [class*="original"], [class*="was"], [class*="normal"]')
      .first().text().trim();
    const originalPrice = parseFloat(origText.replace(/[^0-9,]/g, '').replace(',', '.')) || null;

    offers.push({
      id: id(name, price),
      store: STORE,
      name,
      description: $(el).find('[class*="desc"], [class*="sub"]').first().text().trim(),
      price,
      originalPrice,
      unit: $(el).find('[class*="unit"], [class*="quantity"], [class*="piece"]').first().text().trim() || 'stk.',
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
  logger.info(`[${STORE}] Henter tilbud fra lidl.dk...`);

  try {
    let offers: Offer[];
    try {
      offers = await fetchViaApi();
      logger.ok(`[${STORE}] API: ${offers.length} tilbud`);
    } catch (apiErr: any) {
      logger.warn(`[${STORE}] API fejlede (${apiErr.message}) — prøver HTML scraping...`);
      offers = await fetchViaHtml();
      logger.ok(`[${STORE}] HTML (lidl.dk/c/tilbudsavis/s10013730): ${offers.length} tilbud`);
    }

    return { store: STORE, offers, fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: null };
  } catch (err: any) {
    const msg = err?.response?.status ? `HTTP ${err.response.status}: ${err.response.statusText}` : err.message;
    logger.error(`[${STORE}] ${msg}`);
    return { store: STORE, offers: [], fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: msg };
  }
}
