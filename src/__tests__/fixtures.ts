import type { Product, RecipeBook } from '../types/index.js';

// Products
export const widget: Product = { name: 'widget' };
export const cog: Product = { name: 'cog' };
export const motor: Product = { name: 'motor' };
export const gear: Product = { name: 'gear' };

// A simple book: widget (source) -> cog -> motor
export const simpleBook: RecipeBook = {
  products: [widget, cog, motor],
  recipes: [
    { name: 'mine widget', inputs: [], outputs: [{ product: widget, quantity: 1 }], duration: 1 },
    { name: 'make cog', inputs: [{ product: widget, quantity: 1 }], outputs: [{ product: cog, quantity: 1 }], duration: 1 },
    { name: 'make motor', inputs: [{ product: widget, quantity: 2 }, { product: cog, quantity: 1 }], outputs: [{ product: motor, quantity: 1 }], duration: 2 },
  ],
};

// A book with an awkward ratio to test integerize
// 1 gear takes 3 cogs in 2s => 1 gear constructor needs 1.5 cog/s
export const awkwardBook: RecipeBook = {
  products: [widget, cog, gear],
  recipes: [
    { name: 'mine widget', inputs: [], outputs: [{ product: widget, quantity: 1 }], duration: 1 },
    { name: 'make cog', inputs: [{ product: widget, quantity: 1 }], outputs: [{ product: cog, quantity: 1 }], duration: 1 },
    { name: 'make gear', inputs: [{ product: cog, quantity: 3 }], outputs: [{ product: gear, quantity: 1 }], duration: 2 },
  ],
};
