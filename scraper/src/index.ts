/**
 * Tilbudsret Scraper — kør manuelt med: npm start
 * Automatisk kron: npm run cron
 */
import { scrapeStore } from './scrapers/salling';
import { scrapeRema } from './scrapers/rema';
import { scrapeLidl } from './scrapers/lidl';
import { saveResults, printSummary } from './database';
import { logger } from './logger';
import { ScraperResult } from './types';

export async function runScraper(): Promise<void> {
  logger.separator();
  logger.info(`Tilbudsret Scraper startet — ${new Date().toLocaleString('da-DK')}`);
  logger.separator();

  // Kør alle scrapere parallelt for hastighed
  const results: ScraperResult[] = await Promise.all([
    scrapeStore('netto'),
    scrapeStore('bilka'),
    scrapeStore('foetex'),
    scrapeRema(),
    scrapeLidl(),
  ]);

  printSummary(results);
  saveResults(results);

  const errors = results.filter((r) => r.error !== null);
  if (errors.length > 0) {
    logger.warn(`${errors.length} butik(ker) fejlede. Tjek loggen.`);
  } else {
    logger.ok('Alle butikker hentet uden fejl.');
  }
}

// Kør direkte hvis vi ikke er importeret fra cron.ts
if (require.main === module) {
  runScraper().catch((err) => {
    logger.error(`Fatal fejl: ${err.message}`);
    process.exit(1);
  });
}
