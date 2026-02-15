import { describe, it, expect } from 'vitest';
import { buildProductionGraph } from '../api/build-production-graph.js';
import { simpleBook, awkwardBook, widget, cog, motor } from './fixtures.js';
import type { RecipeBook } from '../types/index.js';

describe('buildProductionGraph', () => {
  it('includes all recipes as nodes', () => {
    const graph = buildProductionGraph(simpleBook);
    expect(graph.nodes).toHaveLength(3);
  });

  it('creates edges for product connections', () => {
    const graph = buildProductionGraph(simpleBook);
    // widget->cog, widget->motor, cog->motor
    expect(graph.edges).toHaveLength(3);
  });

  it('computes reduced ratio for widget -> cog', () => {
    // mine widget: 1 widget/1s, make cog: 1 widget/1s => 1:1
    const graph = buildProductionGraph(simpleBook);
    const edge = graph.edges.find(
      (e) => e.from.name === 'mine widget' && e.to.name === 'make cog',
    );
    expect(edge).toBeDefined();
    expect(edge!.ratio).toEqual([1, 1]);
  });

  it('computes reduced ratio for widget -> motor', () => {
    // mine widget: 1w/1s, make motor: 2w/2s = 1w/s => 1:1
    const graph = buildProductionGraph(simpleBook);
    const edge = graph.edges.find(
      (e) => e.from.name === 'mine widget' && e.to.name === 'make motor',
    );
    expect(edge).toBeDefined();
    expect(edge!.ratio).toEqual([1, 1]);
  });

  it('computes reduced ratio for cog -> motor', () => {
    // make cog: 1 cog/1s, make motor: 1 cog/2s => A=1*1=1, B=1*2=2 => 1:2
    const graph = buildProductionGraph(simpleBook);
    const edge = graph.edges.find(
      (e) => e.from.name === 'make cog' && e.to.name === 'make motor',
    );
    expect(edge).toBeDefined();
    expect(edge!.ratio).toEqual([1, 2]);
  });

  it('computes reduced ratio for awkward book cog -> gear', () => {
    // make cog: 1 cog/1s, make gear: 3 cog/2s => A=3*1=3, B=1*2=2 => 3:2
    const graph = buildProductionGraph(awkwardBook);
    const edge = graph.edges.find(
      (e) => e.from.name === 'make cog' && e.to.name === 'make gear',
    );
    expect(edge).toBeDefined();
    expect(edge!.ratio).toEqual([3, 2]);
  });

  it('handles repeating-decimal durations (e.g. 10/3)', () => {
    // Mimics: corpus source (1/0.5s) -> javelin consumer (1 corpus/3.3333s)
    const corpus = { name: 'corpus' };
    const bolt = { name: 'bolt' };
    const javelin = { name: 'javelin' };
    const floatBook: RecipeBook = {
      products: [corpus, bolt, javelin],
      recipes: [
        { name: 'corpus (source)', inputs: [], outputs: [{ product: corpus, quantity: 1 }], duration: 0.5 },
        { name: 'make javelin', inputs: [{ product: corpus, quantity: 1 }, { product: bolt, quantity: 1 }], outputs: [{ product: javelin, quantity: 1 }], duration: 3.3333 },
      ],
    };
    const graph = buildProductionGraph(floatBook);
    const edge = graph.edges.find(
      (e) => e.from.name === 'corpus (source)' && e.to.name === 'make javelin',
    );
    expect(edge).toBeDefined();
    // A = 1 * 0.5 = 0.5, B = 1 * 3.3333 ≈ 10/3 => ratio 3:20
    expect(edge!.ratio).toEqual([3, 20]);
  });

  it('does not create self-edges', () => {
    const graph = buildProductionGraph(simpleBook);
    for (const edge of graph.edges) {
      expect(edge.from.name).not.toBe(edge.to.name);
    }
  });
});
