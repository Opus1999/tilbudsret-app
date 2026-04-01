/**
 * Cron daemon — kør med: npm run cron
 *
 * Kører scraperen automatisk hver mandag kl. 06:00.
 * Hold processen kørende (fx med pm2 eller som Windows service).
 *
 *   pm2 start dist/cron.js --name tilbudsret-scraper
 */
import cron from 'node-cron';
import { runScraper } from './index';
import { logger } from './logger';

// Cron syntax: sekund minut time dag-i-måned måned dag-i-uge
// '0 0 6 * * 1' = kl. 06:00:00 hver mandag
const SCHEDULE = '0 0 6 * * 1';

logger.separator();
logger.info('Tilbudsret Cron Daemon startet');
logger.info(`Næste kørsel: mandag kl. 06:00 (${SCHEDULE})`);
logger.separator();

cron.schedule(SCHEDULE, async () => {
  logger.info('Cron-trigger: starter ugentlig scraping...');
  try {
    await runScraper();
  } catch (err: any) {
    logger.error(`Cron-kørsel fejlede: ${err.message}`);
  }
}, {
  timezone: 'Europe/Copenhagen',
});

// Kør straks ved opstart hvis det er mandag og vi endnu ikke har kørt i dag
async function runIfMonday() {
  const now = new Date();
  const isMonday = now.getDay() === 1;
  const isEarlyEnough = now.getHours() >= 6;

  if (isMonday && isEarlyEnough) {
    logger.info('Det er mandag og efter kl. 06:00 — kører straks...');
    await runScraper();
  } else {
    const daysUntilMonday = ((1 - now.getDay() + 7) % 7) || 7;
    logger.info(`Venter... Næste mandag om ${daysUntilMonday} dag(e).`);
  }
}

runIfMonday().catch((err) => logger.error(err.message));

// Hold processen i live
process.on('SIGINT', () => {
  logger.info('Cron daemon stoppet (SIGINT).');
  process.exit(0);
});
