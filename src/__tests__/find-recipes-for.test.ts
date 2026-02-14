import { describe, it, expect } from 'vitest';
import { findRecipesFor } from '../api/find-recipes-for.js';
import { simpleBook, widget, cog, motor } from './fixtures.js';

describe('findRecipesFor', () => {
  it('finds the recipe that produces a product', () => {
    const recipes = findRecipesFor(simpleBook, motor);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]!.name).toBe('make motor');
  });

  it('finds source recipes (no inputs)', () => {
    const recipes = findRecipesFor(simpleBook, widget);
    expect(recipes).toHaveLength(1);
    expect(recipes[0]!.inputs).toHaveLength(0);
  });

  it('returns empty for unknown products', () => {
    const recipes = findRecipesFor(simpleBook, { name: 'unobtanium' });
    expect(recipes).toHaveLength(0);
  });
});
