export interface Product {
  name: string;
}

export interface ItemStack {
  product: Product;
  quantity: number;
}
