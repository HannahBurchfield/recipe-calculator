import type { Product, RecipeBook, ProductionChain, ChainNode } from '../types/index.js';
import { findRecipesFor } from './find-recipes-for.js';

export function resolveChain(
  book: RecipeBook,
  product: Product,
  throughput?: number,
): ProductionChain {
  const nodes: ChainNode[] = [];
  const edges: ProductionChain['edges'] = [];
  // Track existing nodes by recipe name so we can merge duplicates
  const nodeByRecipe = new Map<string, ChainNode>();

  function resolve(target: Product, requiredRate: number | undefined): ChainNode | undefined {
    const recipes = findRecipesFor(book, target);
    if (recipes.length === 0) return undefined; // source material

    const recipe = recipes[0]!;
    const outputStack = recipe.outputs.find((o) => o.product.name === target.name)!;
    const outputRate = outputStack.quantity / recipe.duration; // items/sec per constructor

    const count = requiredRate !== undefined ? requiredRate / outputRate : 1;

    // Merge into existing node if this recipe was already resolved
    const existing = nodeByRecipe.get(recipe.name);
    if (existing) {
      existing.count += count;
      return existing;
    }

    const node: ChainNode = { recipe, count };
    nodes.push(node);
    nodeByRecipe.set(recipe.name, node);

    // Recurse into inputs
    for (const input of recipe.inputs) {
      const inputRate = (input.quantity / recipe.duration) * count;
      const upstream = resolve(input.product, inputRate);
      if (upstream) {
        edges.push({ from: upstream, to: node, product: input.product });
      }
    }

    return node;
  }

  resolve(product, throughput);
  return { nodes, edges };
}
