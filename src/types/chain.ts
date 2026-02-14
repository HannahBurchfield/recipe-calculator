import type { Product } from './product.js';
import type { Recipe } from './recipe.js';

export interface ChainNode {
  recipe: Recipe;
  /** Number of constructors running this recipe (can be fractional) */
  count: number;
}

export interface ChainEdge {
  from: ChainNode;
  to: ChainNode;
  product: Product;
}

export interface ProductionChain {
  nodes: ChainNode[];
  edges: ChainEdge[];
}
