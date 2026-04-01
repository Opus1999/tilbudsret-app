import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(__dirname, '..', 'data', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'scraper.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function write(level: string, message: string) {
  ensureLogDir();
  const line = `[${timestamp()}] [${level}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
}

export const logger = {
  info:  (msg: string) => write('INFO ', msg),
  ok:    (msg: string) => write('OK   ', msg),
  warn:  (msg: string) => write('WARN ', msg),
  error: (msg: string) => write('ERROR', msg),

  separator() {
    const line = '─'.repeat(60);
    console.log(line);
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  },
};
