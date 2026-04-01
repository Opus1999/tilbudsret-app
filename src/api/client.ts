/**
 * API client for the Tilbudsret scraper server.
 *
 * Server kører med: cd scraper && npm run serve
 * CORS håndteres af cors-pakken på serveren — ingen proxy nødvendig.
 */
import { Recipe, RecipeIngredient } from '../data/recipeData';
import { Dish, Store } from '../data/mockData';

export const API_BASE_URL = 'http://localhost:3000';

export interface ApiStoreInfo {
  id: string;
  name: string;
  logo: string;
  offersCount: number;
  savings: number;
  error: string | null;
}

export interface ApiHealthResponse {
  ok: boolean;
  hasOffers: boolean;
  recipesReady: boolean;
  recipesGenerating: boolean;
  lastUpdated: string | null;
}

/** Henter serverstatus — hurtigt (< 100ms) */
export async function fetchHealth(): Promise<ApiHealthResponse> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/health`, 3000);
  if (!res.ok) throw new Error(`Health: HTTP ${res.status}`);
  return res.json();
}

/** Henter butiksstatistik — hurtigt, ingen AI */
export async function fetchStores(): Promise<ApiStoreInfo[]> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/stores`, 5000);
  if (!res.ok) throw new Error(`Stores: HTTP ${res.status}`);
  return res.json();
}

/**
 * Henter AI-genererede opskrifter.
 * Første kald kan tage 15–25 sek (Claude genererer) — efterfølgende kald er lynhurtige (cache).
 * Returnerer null hvis scraper stadig kører (202 pending).
 */
export async function fetchRecipes(): Promise<{ recipes: Recipe[]; fromCache: boolean } | null> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/api/recipes`, 60000);
  if (res.status === 202) return null;  // scraper er endnu ikke færdig
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Recipes: HTTP ${res.status}`);
  }
  return res.json();
}

/** Convert API Recipe to the Dish shape used by DishCard */
export function recipeToDish(recipe: Recipe): Dish {
  const stores = [
    ...new Set(
      recipe.ingredients
        .map((i: RecipeIngredient) => i.store)
        .filter((s: string) => s && s.length > 0)
    ),
  ];
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    pricePerPerson: recipe.pricePerPerson,
    originalPrice: recipe.originalPricePerPerson,
    servings: recipe.baseServings,
    emoji: recipe.emoji,
    stores,
    tag: recipe.tag,
  };
}

/** Convert API StoreInfo to the Store shape used by StoreCard */
export function apiStoreToCard(s: ApiStoreInfo): Store {
  return {
    id: s.id,
    name: s.name,
    logo: s.logo,
    savings: s.savings,
    itemsOnSale: s.offersCount,
  };
}

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}
