import type { ProductionChain } from '../types/index.js';

const DEFAULT_TOLERANCE = 0.01;
const MAX_SCALAR = 1000;

function isNearInteger(value: number, tolerance: number): boolean {
  return Math.abs(value - Math.round(value)) <= tolerance;
}

export function integerize(chain: ProductionChain, tolerance = DEFAULT_TOLERANCE): ProductionChain {
  const counts = chain.nodes.map((n) => n.count);

  let bestK = 1;
  for (let k = 1; k <= MAX_SCALAR; k++) {
    if (counts.every((c) => isNearInteger(c * k, tolerance))) {
      bestK = k;
      break;
    }
  }

  const newNodes = chain.nodes.map((node) => ({
    ...node,
    count: Math.round(node.count * bestK),
  }));

  // Rebuild edges pointing to the new node objects (match by recipe name, not reference)
  const nodeByName = new Map(newNodes.map((n) => [n.recipe.name, n]));
  const newEdges = chain.edges.map((edge) => ({
    from: nodeByName.get(edge.from.recipe.name)!,
    to: nodeByName.get(edge.to.recipe.name)!,
    product: edge.product,
  }));

  return { nodes: newNodes, edges: newEdges };
}
