import type { ItemStack } from './product.js';

export interface Recipe {
  name: string;
  inputs: ItemStack[];
  outputs: ItemStack[];
  /** Seconds per run */
  duration: number;
}
