/**
 * Fetches live data from the scraper API progressively:
 *   1. /health  — confirms server is up (fast)
 *   2. /api/stores — store stats, no AI needed (fast)
 *   3. /api/recipes — AI-generated recipes, polls if scraper is still running
 *
 * Falls back to mock data silently if server isn't reachable.
 */
import { useEffect, useState } from 'react';
import {
  fetchHealth,
  fetchStores,
  fetchRecipes,
  recipeToDish,
  apiStoreToCard,
} from '../api/client';
import { Dish, Store, weeklyDishes, cheapestStores } from '../data/mockData';
import { Recipe, recipes as mockRecipes } from '../data/recipeData';
import { setGeneratedRecipes } from '../data/recipeStore';

export type LiveStatus =
  | 'connecting'
  | 'fetching_stores'
  | 'scraper_running'
  | 'generating_recipes'
  | 'live'
  | 'offline';

export interface RecipesState {
  dishes: Dish[];
  stores: Store[];
  recipes: Recipe[];
  loading: boolean;
  status: LiveStatus;
  isLive: boolean;
}

const POLL_INTERVAL_MS = 8000;   // retry interval while scraper/AI is running
const MAX_RETRIES = 15;           // give up after ~2 minutes

export function useRecipes(): RecipesState {
  const [dishes, setDishes] = useState<Dish[]>(weeklyDishes);
  const [stores, setStores] = useState<Store[]>(cheapestStores);
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LiveStatus>('connecting');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let retries = 0;

    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 1000);

    async function load() {
      // ── 1. Health check — confirm server is up ─────────────────────────────
      try {
        await fetchHealth();
      } catch (err) {
        if (cancelled) return;
        console.warn('[useRecipes] Server ikke nået:', err);
        setStatus('offline');
        clearTimeout(skeletonTimer);
        setLoading(false);
        return;
      }
      if (cancelled) return;

      // ── 2. Stores (no AI — responds immediately) ───────────────────────────
      setStatus('fetching_stores');
      try {
        const apiStores = await fetchStores();
        if (!cancelled) {
          const active = apiStores
            .filter((s) => !s.error && s.offersCount > 0)
            .map(apiStoreToCard);
          if (active.length > 0) setStores(active);
        }
      } catch {
        // Keep mock stores
      }
      if (cancelled) return;

      // ── 3. Recipes — poll until scraper + AI are done ──────────────────────
      clearTimeout(skeletonTimer);
      setLoading(false);

      async function tryRecipes() {
        if (cancelled || retries >= MAX_RETRIES) {
          if (!cancelled) setStatus('offline');
          return;
        }
        retries++;

        let result;
        try {
          result = await fetchRecipes();
        } catch {
          if (!cancelled) setStatus('offline');
          return;
        }
        if (cancelled) return;

        if (result === null) {
          // Scraper is still running
          setStatus('scraper_running');
          setTimeout(tryRecipes, POLL_INTERVAL_MS);
          return;
        }

        setStatus('generating_recipes');

        const { recipes: apiRecipes } = result;
        setGeneratedRecipes(apiRecipes as any);
        setRecipes(apiRecipes);
        setDishes(apiRecipes.map(recipeToDish));
        setIsLive(true);
        setStatus('live');
      }

      setStatus('generating_recipes');
      tryRecipes();
    }

    load();

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
    };
  }, []);

  return { dishes, stores, recipes, loading, status, isLive };
}
