/**
 * In-memory store for AI-generated recipes.
 * Set by useRecipes hook, read by RecipeScreen.
 */
import { Recipe } from './recipeData';

let generatedRecipes: Recipe[] = [];

export function setGeneratedRecipes(recipes: Recipe[]): void {
  generatedRecipes = recipes;
}

export function getGeneratedRecipeById(id: string): Recipe | undefined {
  return generatedRecipes.find((r) => r.id === id);
}
