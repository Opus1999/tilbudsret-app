/**
 * Tilbudsret API Server — kør med: npm run serve
 *
 * Starter straks på port 3000, kører derefter scraper i baggrunden
 * hvis offers.json mangler, og pre-genererer AI-opskrifter automatisk.
 *
 * Endpoints:
 *   GET /health        — Serverstatus + om opskrifter er klar
 *   GET /api/recipes   — AI-genererede opskrifter (caches til tilbud ændres)
 *   GET /api/stores    — Butiksstatistik
 *   GET /api/offers    — Rå tilbudsdata
 */

import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generateRecipes, GeneratedRecipe } from './ai/generateRecipes';
import { runScraper } from './index';
import { Database, Offer } from './types';
import { logger } from './logger';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_PATH = path.join(__dirname, '../data/offers.json');

// Tillad alle origins — håndterer preflight OPTIONS automatisk
app.use(cors());

// ── Recipe cache + generation queue ──────────────────────────────────────────
let cachedRecipes: GeneratedRecipe[] | null = null;
let cacheKey = '';
let generationPromise: Promise<GeneratedRecipe[]> | null = null;

function readDb(): Database | null {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) as Database;
  } catch {
    return null;
  }
}

function allOffers(db: Database): Offer[] {
  return db.results.flatMap((r) => r.offers);
}

function dbCacheKey(db: Database): string {
  const total = db.results.reduce((n, r) => n + r.offers.length, 0);
  return `${db.lastUpdated}:${total}`;
}

async function getOrGenerateRecipes(db: Database): Promise<GeneratedRecipe[]> {
  const key = dbCacheKey(db);
  if (cachedRecipes && key === cacheKey) return cachedRecipes;

  if (!generationPromise) {
    generationPromise = generateRecipes(allOffers(db))
      .then((recipes) => {
        cachedRecipes = recipes;
        cacheKey = key;
        return recipes;
      })
      .finally(() => {
        generationPromise = null;
      });
  }

  return generationPromise;
}

// ── Store helpers ─────────────────────────────────────────────────────────────
const STORE_NAMES: Record<string, string> = {
  netto: 'Netto', bilka: 'Bilka', foetex: 'Føtex', rema1000: 'Rema 1000', lidl: 'Lidl',
};
const STORE_LOGOS: Record<string, string> = {
  netto: '🏪', bilka: '🏬', foetex: '🛍️', rema1000: '🛒', lidl: '🟡',
};

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({
    ok: true,
    hasOffers: !!db,
    lastUpdated: db?.lastUpdated ?? null,
    recipesReady: !!cachedRecipes,
    recipesGenerating: !!generationPromise,
  });
});

app.get('/api/stores', (_req: Request, res: Response) => {
  const db = readDb();
  if (!db) {
    res.status(202).json([]);   // 202 = scraper er endnu ikke færdig
    return;
  }
  const stores = db.results.map((r) => {
    const withDiscount = r.offers.filter(
      (o) => o.originalPrice != null && o.originalPrice > o.price
    );
    const savings = Math.round(
      withDiscount.reduce((sum, o) => sum + ((o.originalPrice ?? o.price) - o.price), 0)
    );
    return {
      id: r.store,
      name: STORE_NAMES[r.store] ?? r.store,
      logo: STORE_LOGOS[r.store] ?? '🏪',
      offersCount: r.offers.length,
      savings,
      fetchedAt: r.fetchedAt,
      error: r.error,
    };
  });
  res.json(stores);
});

app.get('/api/offers', (_req: Request, res: Response) => {
  const db = readDb();
  if (!db) {
    res.status(404).json({ error: 'offers.json ikke fundet — scraper kører i baggrunden' });
    return;
  }
  res.json(db);
});

app.get('/api/recipes', async (_req: Request, res: Response) => {
  const db = readDb();
  if (!db) {
    res.status(202).json({ pending: true, message: 'Scraper kører — prøv igen om 30 sekunder' });
    return;
  }
  try {
    const recipes = await getOrGenerateRecipes(db);
    res.json({
      recipes,
      generatedAt: new Date().toISOString(),
      fromCache: !generationPromise,
    });
  } catch (err: any) {
    logger.error(`[Server] AI fejl: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ── Start server STRAKS, kør scraper i baggrunden ────────────────────────────
app.listen(PORT, () => {
  logger.separator();
  logger.info('Tilbudsret API Server kørende');
  logger.info(`  http://localhost:${PORT}/api/recipes`);
  logger.info(`  http://localhost:${PORT}/api/stores`);
  logger.info(`  http://localhost:${PORT}/health`);
  logger.separator();
  logger.info(`SALLING_API_KEY: ${process.env.SALLING_API_KEY ? '✓ sat' : '✗ MANGLER'}`);
  logger.info(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✓ sat' : '✗ MANGLER'}`);
  logger.separator();
});

async function runBackground() {
  let db = readDb();

  if (!db) {
    logger.info('[Baggrund] offers.json mangler — henter tilbud...');
    try {
      await runScraper();
      logger.ok('[Baggrund] Tilbud hentet ✓');
      db = readDb();
    } catch (err: any) {
      logger.warn(`[Baggrund] Scraper fejlede: ${err.message}`);
    }
  }

  if (db) {
    const sallingOffers = allOffers(db).filter((o) =>
      ['netto', 'bilka', 'foetex'].includes(o.store)
    );
    if (sallingOffers.length > 0 && !cachedRecipes) {
      logger.info(`[Baggrund] Genererer AI-opskrifter fra ${sallingOffers.length} tilbud...`);
      getOrGenerateRecipes(db)
        .then(() => logger.ok('[Baggrund] AI-opskrifter klar ✓'))
        .catch((err: any) => logger.warn(`[Baggrund] AI fejlede: ${err.message}`));
    } else if (sallingOffers.length === 0) {
      logger.warn('[Baggrund] Ingen tilbud fra Netto/Bilka/Føtex — tjek SALLING_API_KEY i .env');
    }
  }
}

runBackground().catch((err: any) => logger.error(`[Baggrund] Fatal: ${err.message}`));
