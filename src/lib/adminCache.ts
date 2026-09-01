// src/lib/adminCache.ts
//
// Admin-specific cache wrapper around the shared `lib/requestCache.ts`.
// Kept as its own module (instead of importing requestCache directly
// everywhere in data/admin.ts) so:
//   - Admin call sites don't need to change their imports.
//   - Admin-only TTL tuning lives in one place (see SLOW_TTL_MS below).
//
// IMPORTANT: this shares its underlying store/concurrency-limiter with
// requestCache.ts, which `hooks/useProducts.ts` also uses. That means
// an admin product mutation calling invalidateAdminCache('products:')
// also invalidates the storefront's cached product list — which is
// exactly what you want (admin edits a product -> storefront shows
// the fresh version on next load, no stale cache).

import {
  cached as cachedGeneric,
  invalidateCache,
  invalidateCacheKey,
  isCached as isCachedGeneric,
} from './requestCache';

// Fast-changing data: KPIs, revenue charts, recent orders. Refetch at
// most once a minute.
export const DEFAULT_TTL_MS = 60_000;

// Slow-changing data: inventory, discounts, campaigns, admin team
// members, abandoned carts. These don't need a fresh read every time
// an admin flips between tabs, so give them a much longer TTL —
// flipping back and forth within this window reuses the cache instead
// of re-hitting Postgres at all.
export const SLOW_TTL_MS = 5 * 60_000;

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  return cachedGeneric(key, fetcher, ttlMs);
}

/**
 * Clears cached entries.
 * - No arguments: clears the entire (shared) cache.
 * - A string prefix: clears only matching keys, e.g.
 *   invalidateAdminCache('products:') clears 'products:all' AND the
 *   storefront's 'products:active' key.
 */
export function invalidateAdminCache(prefix?: string): void {
  invalidateCache(prefix);
}

export function invalidateAdminCacheKey(key: string): void {
  invalidateCacheKey(key);
}

export function isCached(key: string, ttlMs: number = DEFAULT_TTL_MS): boolean {
  return isCachedGeneric(key, ttlMs);
}