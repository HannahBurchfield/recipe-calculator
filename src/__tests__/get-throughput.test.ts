import { describe, it, expect } from 'vitest';
import { resolveChain } from '../api/resolve-chain.js';
import { getThroughput } from '../api/get-throughput.js';
import { simpleBook, widget, cog, motor } from './fixtures.js';

describe('getThroughput', () => {
  it('returns correct output throughput for the target product', () => {
    const chain = resolveChain(simpleBook, motor, 1);
    expect(getThroughput(chain, motor)).toBeCloseTo(1, 5);
  });

  it('returns zero net throughput for fully-consumed intermediates', () => {
    const chain = resolveChain(simpleBook, motor, 1);
    // cog: produced at 1/s, consumed at 1/s by motor
    expect(getThroughput(chain, cog)).toBeCloseTo(0, 5);
  });

  it('returns zero net throughput for source materials (fully consumed)', () => {
    const chain = resolveChain(simpleBook, motor, 1);
    // widget: mined 3/s, consumed 2/s by motor + 1/s by cog = 3/s
    expect(getThroughput(chain, widget)).toBeCloseTo(0, 5);
  });

  it('returns nonzero for products not fully consumed', () => {
    // Single cog maker: produces 1 cog/s, consumes nothing downstream
    const chain = resolveChain(simpleBook, cog, 1);
    expect(getThroughput(chain, cog)).toBeCloseTo(1, 5);
  });
});
