import type { Product } from './product.js';
import type { Recipe } from './recipe.js';

export interface RecipeBook {
  recipes: Recipe[];
  products: Product[];
}
