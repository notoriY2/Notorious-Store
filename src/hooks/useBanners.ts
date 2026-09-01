// src/hooks/useBanners.ts
//
// Thin data hook around data/banners.ts's getStorefrontBanners(). Two
// responsibilities beyond the fetch itself:
//
//   1. Track loading/error state the way every other storefront hook
//      does (useProducts, useCurrency, etc).
//   2. Fire an impression once per banner the first time it's loaded
//      into this hook's state — guarded by a ref-backed Set so React
//      StrictMode's dev double-invoke, and any re-render caused by
//      something else in the tree, never double-counts an impression
//      for the same banner id.

import { useEffect, useRef, useState } from 'react';

import {
  getStorefrontBanners,
  incrementBannerImpression,
  StorefrontBanner,
} from '../data/banners';

export const useBanners = () => {
  const [banners, setBanners] = useState<StorefrontBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persists across re-renders and StrictMode's double-mount, unlike a
  // plain local variable — this is what keeps impressions to exactly
  // one per banner id for the lifetime of this hook instance.
  const impressedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const loadBanners = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getStorefrontBanners();

        if (cancelled) {
          return;
        }

        setBanners(data);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load banners:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load banners.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fire-and-forget impressions. Runs whenever `banners` changes, but
  // the ref guard means each banner id only ever triggers one RPC call
  // no matter how many times this effect re-runs.
  useEffect(() => {
    banners.forEach(banner => {
      if (impressedIdsRef.current.has(banner.id)) {
        return;
      }

      impressedIdsRef.current.add(banner.id);

      void incrementBannerImpression(banner.id);
    });
  }, [banners]);

  return { banners, isLoading, error };
};