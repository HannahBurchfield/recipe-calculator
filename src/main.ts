import type { Product, RecipeBook } from './types/index.js';
import { resolveChain, integerize, getThroughput } from './api/index.js';

// Example: 2 widgets + 1 cog => 1 motor in 2s
// Widgets are a source, cogs take 1s each

const widget: Product = { name: 'widget' };
const cog: Product = { name: 'cog' };
const motor: Product = { name: 'motor' };

const book: RecipeBook = {
  products: [widget, cog, motor],
  recipes: [
    { name: 'mine widget', inputs: [], outputs: [{ product: widget, quantity: 1 }], duration: 1 },
    { name: 'make cog', inputs: [{ product: widget, quantity: 1 }], outputs: [{ product: cog, quantity: 1 }], duration: 1 },
    { name: 'make motor', inputs: [{ product: widget, quantity: 2 }, { product: cog, quantity: 1 }], outputs: [{ product: motor, quantity: 1 }], duration: 2 },
  ],
};

// Resolve a chain for 1 motor/sec
const chain = resolveChain(book, motor, 1);
const intChain = integerize(chain);

console.log('=== Production chain for 1 motor/sec ===');
for (const node of intChain.nodes) {
  console.log(`  ${node.count}x ${node.recipe.name}`);
}
console.log(`Motor throughput: ${getThroughput(intChain, motor).toFixed(2)}/s`);
console.log(`Widget throughput (net): ${getThroughput(intChain, widget).toFixed(2)}/s`);
