import { describe, it, expect } from 'vitest';
import { resolveChain } from '../api/resolve-chain.js';
import { simpleBook, widget, cog, motor } from './fixtures.js';

describe('resolveChain', () => {
  it('resolves a single source product to one node', () => {
    const chain = resolveChain(simpleBook, widget);
    expect(chain.nodes).toHaveLength(1);
    expect(chain.nodes[0]!.recipe.name).toBe('mine widget');
    expect(chain.nodes[0]!.count).toBe(1);
  });

  it('resolves motor chain with correct node count', () => {
    const chain = resolveChain(simpleBook, motor);
    // motor, cog, widget
    expect(chain.nodes).toHaveLength(3);
  });

  it('scales constructor counts to meet throughput', () => {
    // 1 motor/s requires 2 motor constructors (each does 0.5/s)
    const chain = resolveChain(simpleBook, motor, 1);
    const motorNode = chain.nodes.find((n) => n.recipe.name === 'make motor');
    expect(motorNode!.count).toBe(2);
  });

  it('deduplicates widget miners when fed by both motor and cog recipes', () => {
    const chain = resolveChain(simpleBook, motor, 1);
    const widgetNodes = chain.nodes.filter((n) => n.recipe.name === 'mine widget');
    expect(widgetNodes).toHaveLength(1);
    // motor needs 2w/2s * 2 constructors = 2/s, cog needs 1/s => 3 miners
    expect(widgetNodes[0]!.count).toBe(3);
  });

  it('returns empty chain for unknown product', () => {
    const chain = resolveChain(simpleBook, { name: 'unobtanium' });
    expect(chain.nodes).toHaveLength(0);
  });
});
