import type { Product } from './product.js';
import type { Recipe } from './recipe.js';

export interface GraphEdge {
  from: Recipe;
  to: Recipe;
  product: Product;
  /** Constructor ratio [A, B]: A constructors of `from` supply B constructors of `to` */
  ratio: [number, number];
}

export interface ProductionGraph {
  nodes: Recipe[];
  edges: GraphEdge[];
}
