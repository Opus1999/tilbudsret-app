export interface Offer {
  id: string;
  store: Store;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  category: string;
  validFrom: string; // ISO date string
  validTo: string;   // ISO date string
  imageUrl: string | null;
  scrapedAt: string; // ISO timestamp
}

export type Store = 'netto' | 'rema1000' | 'lidl' | 'bilka' | 'foetex';

export interface ScraperResult {
  store: Store;
  offers: Offer[];
  fetchedAt: string;
  durationMs: number;
  error: string | null;
}

export interface Database {
  lastUpdated: string;
  results: ScraperResult[];
}
