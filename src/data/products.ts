// src/data/products.ts
//
// NOTE: Real product data now comes from Supabase — see the `products`
// table and `src/hooks/useProducts.ts`. This file only keeps the shared
// `Product` type definition, plus a deprecated empty array export so any
// code that hasn't been migrated to the hook yet (e.g. `data/admin.ts`,
// `AdminContent.tsx`) doesn't break at import time. Those get migrated in
// a later step.
export interface ProductSizeAvailability {
  size: string;
  available: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];

  // Whether this product renders on the main storefront Product
  // Floor/Grid. Independent of purchasability — a product with
  // showOnFloor: false is still a real, live product reachable via a
  // banner or hero click, cart, checkout, etc. Optional so any code
  // constructing a Product without this field still type-checks;
  // treat a missing value as `true`.
  showOnFloor?: boolean;

  // True only for a testing product created inline inside a banner
  // editor. Excluded from the main catalog (AdminProducts) and from
  // the storefront's general active-product fetch — only reachable
  // through the one banner it was staged under, until promoted.
  isStaged?: boolean;

  position: {
    top: string;
    left: string;
  };
  mobilePosition?: {
    top: string;
    left: string;
  };
  rotation: number;
  scale: number;
  zIndex: number;
  category?: 'top' | 'bottom' | 'accessory';
  soldOut?: boolean;

  // Per-size stock availability, sourced from the joined product_inventory
  // rows in useProducts.ts (via lib/mapProduct.ts). Optional so any code
  // constructing a Product without inventory data (mock data, admin forms
  // that don't touch stock, etc.) still type-checks. Downstream consumers
  // that need it should default to `[]` rather than assuming it exists.
  sizes?: ProductSizeAvailability[];
}

/**
 * @deprecated Static mock catalog, kept only so legacy imports (admin mock
 * data, content manager) don't break at import time. Real storefront data
 * now comes from `useProducts()`. Do not add new usages of this array.
 */
export const products: Product[] = [];