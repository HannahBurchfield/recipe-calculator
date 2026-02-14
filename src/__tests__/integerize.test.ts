import { describe, it, expect } from 'vitest';
import { resolveChain } from '../api/resolve-chain.js';
import { integerize } from '../api/integerize.js';
import { awkwardBook, gear } from './fixtures.js';

describe('integerize', () => {
  it('scales fractional counts to integers', () => {
    // 1 gear constructor: needs 3 cogs/2s = 1.5 cog/s => 1.5 cog makers => 1.5 widget miners
    const chain = resolveChain(awkwardBook, gear);
    const intChain = integerize(chain);

    for (const node of intChain.nodes) {
      expect(Number.isInteger(node.count)).toBe(true);
    }
  });

  it('finds the smallest integer multiplier', () => {
    const chain = resolveChain(awkwardBook, gear);
    // counts are 1, 1.5, 1.5 => multiplier should be 2 => 2, 3, 3
    const intChain = integerize(chain);

    const gearNode = intChain.nodes.find((n) => n.recipe.name === 'make gear');
    const cogNode = intChain.nodes.find((n) => n.recipe.name === 'make cog');
    const widgetNode = intChain.nodes.find((n) => n.recipe.name === 'mine widget');

    expect(gearNode!.count).toBe(2);
    expect(cogNode!.count).toBe(3);
    expect(widgetNode!.count).toBe(3);
  });

  it('leaves already-integer chains unchanged', () => {
    const chain = resolveChain(awkwardBook, gear, 1);
    // With throughput=1: gear needs 2, cog needs 3, widget needs 3 — already integers
    const intChain = integerize(chain);
    expect(intChain.nodes.map((n) => n.count).sort()).toEqual(
      chain.nodes.map((n) => n.count).sort(),
    );
  });
});
