/**
 * Rema 1000 scraper.
 *
 * Primær: Rema's interne app-API (cphapp.rema1000.dk)
 * Fallback: HTML-scraping af rema1000.dk/avis/
 *
 * Korrekte URLs verificeret 2026-04-01:
 *   - Hjemmeside: https://rema1000.dk/
 *   - Avis/tilbud: https://rema1000.dk/avis/
 *   - App-API base: https://cphapp.rema1000.dk/api
 */
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { Offer, ScraperResult } from '../types';
import { logger } from '../logger';

const STORE = 'rema1000' as const;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
  'Accept-Language': 'da-DK,da;q=0.9',
};

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

  // Rema app-API — returnerer aktuelle tilbud uden auth
  const { data } = await axios.get('https://cphapp.rema1000.dk/api/v2/leaflet/public/preview', {
    headers: HEADERS,
    timeout: 12000,
  });

  const items: any[] = data?.items ?? data?.offers ?? data ?? [];
  if (!Array.isArray(items) || items.length === 0) throw new Error('Tom respons fra API');

  return items.map((item: any) => ({
    id: id(item.name ?? item.heading ?? '', Number(item.price ?? item.discountPrice ?? 0)),
    store: STORE,
    name: item.name ?? item.heading ?? item.title ?? 'Ukendt vare',
    description: item.description ?? item.subtitle ?? '',
    price: Number(item.price ?? item.discountPrice ?? 0),
    originalPrice: item.originalPrice != null ? Number(item.originalPrice) : null,
    unit: item.unit ?? item.unitSize ?? item.quantity ?? 'stk.',
    category: item.category ?? item.categories?.[0] ?? 'Andet',
    validFrom: item.validFrom ?? item.startDate ?? from,
    validTo: item.validTo ?? item.endDate ?? to,
    imageUrl: item.image ?? item.imageUrl ?? item.thumbnail ?? null,
    scrapedAt,
  }));
}

async function fetchViaHtml(): Promise<Offer[]> {
  const { from, to } = weekBounds();
  const scrapedAt = new Date().toISOString();

  // Korrekt URL verificeret: rema1000.dk/avis/
  const { data: html } = await axios.get('https://rema1000.dk/avis/', {
    headers: { ...HEADERS, Accept: 'text/html' },
    timeout: 15000,
  });

  const $ = cheerio.load(html);
  const offers: Offer[] = [];

  // Rema bruger Nuxt.js — tilbudsdata kan ligge i __NUXT_DATA__ script-tag
  const nuxtScript = $('script#__NUXT_DATA__, script[type="application/json"]').first().html();
  if (nuxtScript) {
    try {
      const json = JSON.parse(nuxtScript);
      // Flad Nuxt state-array ud og find offer-lignende objekter
      const flat: any[] = Array.isArray(json) ? json : Object.values(json).flat();
      flat.forEach((item: any) => {
        if (!item || typeof item !== 'object') return;
        if (!(item.name || item.title) || !(item.price || item.discountPrice)) return;
        const price = Number(item.price ?? item.discountPrice ?? 0);
        if (price === 0) return;
        const name = item.name ?? item.title ?? '';
        offers.push({
          id: id(name, price),
          store: STORE,
          name,
          description: item.description ?? '',
          price,
          originalPrice: item.originalPrice != null ? Number(item.originalPrice) : null,
          unit: item.unit ?? 'stk.',
          category: item.category ?? 'Andet',
          validFrom: item.validFrom ?? from,
          validTo: item.validTo ?? to,
          imageUrl: item.image ?? item.imageUrl ?? null,
          scrapedAt,
        });
      });
      if (offers.length > 0) return offers;
    } catch {
      // JSON parse fejlede — fortsæt til DOM-scraping
    }
  }

  // DOM-scraping som sidste fallback
  // Rema Nuxt-sider bruger typisk data-testid eller product-card klasser
  const selectors = [
    '[data-testid*="product"]',
    '[data-testid*="offer"]',
    '[class*="ProductCard"]',
    '[class*="product-card"]',
    '[class*="OfferCard"]',
    'article',
  ];

  $(selectors.join(', ')).each((_, el) => {
    const name = $(el)
      .find('[class*="title"], [class*="name"], [class*="heading"], h2, h3, h4')
      .first().text().trim();
    const priceText = $(el).find('[class*="price"], [class*="Price"]').first().text().trim();
    const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    if (!name || price === 0) return;

    const origText = $(el).find('[class*="strike"], [class*="original"], [class*="was"]').first().text().trim();
    const originalPrice = parseFloat(origText.replace(/[^0-9,]/g, '').replace(',', '.')) || null;

    offers.push({
      id: id(name, price),
      store: STORE,
      name,
      description: $(el).find('[class*="desc"], [class*="sub"]').first().text().trim(),
      price,
      originalPrice,
      unit: $(el).find('[class*="unit"], [class*="quantity"]').first().text().trim() || 'stk.',
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
  logger.info(`[${STORE}] Henter tilbud fra rema1000.dk...`);

  try {
    let offers: Offer[];
    try {
      offers = await fetchViaApi();
      logger.ok(`[${STORE}] API (cphapp.rema1000.dk): ${offers.length} tilbud`);
    } catch (apiErr: any) {
      logger.warn(`[${STORE}] API fejlede (${apiErr.message}) — prøver HTML scraping...`);
      offers = await fetchViaHtml();
      logger.ok(`[${STORE}] HTML (rema1000.dk/avis/): ${offers.length} tilbud`);
    }

    return { store: STORE, offers, fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: null };
  } catch (err: any) {
    const msg = err?.response?.status ? `HTTP ${err.response.status}: ${err.response.statusText}` : err.message;
    logger.error(`[${STORE}] ${msg}`);
    return { store: STORE, offers: [], fetchedAt: new Date().toISOString(), durationMs: Date.now() - start, error: msg };
  }
}
