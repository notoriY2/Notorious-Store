// src/types/Product.ts
// NOTE: `Product` is defined once, in `../data/products.ts` (it includes
// `images`, which every component now expects). This file no longer
// declares its own competing `Product` interface — it just re-exports
// the canonical one so existing imports from `../types/Product` keep
// working, and adds the cart-specific `CartItem` type on top of it.
export type { Product } from '../data/products';
import { Product } from '../data/products';

export interface CartItem extends Product {
  quantity: number;
  uniqueId: string;
  selectedSize?: string;
  selectedColor?: string;
}