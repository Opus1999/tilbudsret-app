import * as fs from 'fs';
import * as path from 'path';
import { Database, ScraperResult } from './types';
import { logger } from './logger';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'offers.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadDatabase(): Database {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    return { lastUpdated: '', results: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Database;
  } catch {
    logger.warn('Kunne ikke læse databasen — starter forfra.');
    return { lastUpdated: '', results: [] };
  }
}

export function saveResults(results: ScraperResult[]): void {
  ensureDataDir();

  const db: Database = {
    lastUpdated: new Date().toISOString(),
    results,
  };

  // Write atomically: temp file → rename
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);

  const totalOffers = results.reduce((n, r) => n + r.offers.length, 0);
  logger.ok(`Database gemt → ${DB_FILE}`);
  logger.ok(`Totalt: ${totalOffers} tilbud på tværs af ${results.length} butikker`);
}

export function printSummary(results: ScraperResult[]): void {
  logger.separator();
  logger.info('OPSUMMERING');
  for (const r of results) {
    if (r.error) {
      logger.error(`  ${r.store.padEnd(10)} FEJL: ${r.error}`);
    } else {
      logger.ok(`  ${r.store.padEnd(10)} ${String(r.offers.length).padStart(3)} tilbud  (${r.durationMs}ms)`);
    }
  }
  logger.separator();
}
