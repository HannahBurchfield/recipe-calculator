import type { Product, Recipe, RecipeBook } from '../types/index.js';

export function findRecipesFor(book: RecipeBook, product: Product): Recipe[] {
  return book.recipes.filter((recipe) =>
    recipe.outputs.some((output) => output.product.name === product.name),
  );
}
