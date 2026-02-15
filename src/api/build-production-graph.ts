import type { RecipeBook } from '../types/recipe-book.js';
import type { ProductionGraph, GraphEdge } from '../types/graph.js';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

const TOLERANCE = 0.01;
const MAX_SCALAR = 1000;

function isNearInteger(value: number, tolerance: number): boolean {
  return Math.abs(value - Math.round(value)) <= tolerance;
}

/** Convert a float ratio a:b to reduced integers by finding a small common scalar. */
function integerRatio(a: number, b: number): [number, number] {
  for (let k = 1; k <= MAX_SCALAR; k++) {
    if (isNearInteger(a * k, TOLERANCE) && isNearInteger(b * k, TOLERANCE)) {
      let ai = Math.round(a * k);
      let bi = Math.round(b * k);
      const d = gcd(ai, bi);
      return [ai / d, bi / d];
    }
  }
  return [Math.round(a), Math.round(b)];
}

export function buildProductionGraph(book: RecipeBook): ProductionGraph {
  const edges: GraphEdge[] = [];

  for (const producer of book.recipes) {
    for (const output of producer.outputs) {
      for (const consumer of book.recipes) {
        if (consumer === producer) continue;
        const input = consumer.inputs.find((i) => i.product.name === output.product.name);
        if (!input) continue;

        // Ratio A:B = (input.qty * producer.duration) : (output.qty * consumer.duration)
        const [a, b] = integerRatio(
          input.quantity * producer.duration,
          output.quantity * consumer.duration,
        );

        edges.push({
          from: producer,
          to: consumer,
          product: output.product,
          ratio: [a, b],
        });
      }
    }
  }

  return { nodes: book.recipes, edges };
}
