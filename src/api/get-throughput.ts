import type { Product, ProductionChain } from '../types/index.js';

export function getThroughput(chain: ProductionChain, product: Product): number {
  let production = 0;
  let consumption = 0;

  for (const node of chain.nodes) {
    for (const output of node.recipe.outputs) {
      if (output.product.name === product.name) {
        production += (output.quantity / node.recipe.duration) * node.count;
      }
    }
    for (const input of node.recipe.inputs) {
      if (input.product.name === product.name) {
        consumption += (input.quantity / node.recipe.duration) * node.count;
      }
    }
  }

  return production - consumption;
}
