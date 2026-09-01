// src/hooks/useProducts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { cached, invalidateCache } from '../lib/requestCache';
import { Product } from '../types/Product';
import { mapRowToProduct, ProductRow } from '../lib/mapProduct';

export { mapRowToProduct };
export type { ProductRow };

// Slim projection for fast initial floor render using the correct separate coordinate columns
const PRODUCTS_SELECT_FLOOR = `
  id,
  slug,
  name,
  price,
  image,
  images,
  category,
  sold_out,
  position_top,
  position_left,
  mobile_position_top,
  mobile_position_left,
  rotation,
  scale,
  z_index,
  show_on_floor,
  product_inventory (
    size,
    available
  )
`;

const PRODUCTS_SELECT_FULL = `
  *,
  product_inventory (
    size,
    available
  )
`;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const PRODUCTS_CACHE_TTL_MS = 2 * 60_000; // 2 minutes
const PRODUCTS_CACHE_KEY = 'products:active';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (message: string | undefined): boolean => {
  if (!message) return false;
  const msg = message.toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('too many') ||
    msg.includes('econnreset') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504')
  );
};

const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  let attempt = 0;
  let lastErrorMessage: string | null = null;

  while (attempt <= MAX_RETRIES) {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(PRODUCTS_SELECT_FLOOR)
      .eq('status', 'Active')
      .eq('is_staged', false)
      .order('z_index', { ascending: true });

    if (!fetchError) {
      return (data as unknown as ProductRow[]).map(mapRowToProduct);
    }

    lastErrorMessage = fetchError.message;
    const canRetry = attempt < MAX_RETRIES && isRetryableError(fetchError.message);

    if (!canRetry) {
      console.error('Failed to load products:', fetchError);
      throw new Error(fetchError.message);
    }

    const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 200;
    await sleep(delay);
    attempt += 1;
  }

  throw new Error(lastErrorMessage ?? 'Failed to load products');
};

// On-demand fetch for full product details (description, features, etc.) when ProductDetail opens
export const fetchProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT_FULL)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Failed to fetch full product details:', error);
    return null;
  }

  return mapRowToProduct(data as unknown as ProductRow);
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    if (forceRefresh) {
      invalidateCache(PRODUCTS_CACHE_KEY);
    }

    try {
      const result = await cached(
        PRODUCTS_CACHE_KEY,
        fetchProductsFromSupabase,
        PRODUCTS_CACHE_TTL_MS
      );

      if (isMountedRef.current) {
        setProducts(result);
        setIsLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      if (isMountedRef.current) {
        setError(message);
        setProducts([]);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => fetchProducts(true), [fetchProducts]);

  return { products, isLoading, error, refetch };
};