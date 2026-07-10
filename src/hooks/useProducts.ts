'use client';

import { useState, useEffect, useMemo } from 'react';
import { productApi } from '@/lib/api';

interface UseProductsOptions {
  /** Query params forwarded to /products (e.g. { isNewArrival: 'true', limit: 8 }) */
  params?: Record<string, string | number>;
}

/**
 * Fetch a product list with the given filters.
 * Re-fetches when the params change (by value).
 */
export function useProducts({ params }: UseProductsOptions = {}) {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable dependency — params objects are usually recreated per render
  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAllProducts(JSON.parse(paramsKey));
        if (cancelled) return;
        if (response.error) {
          setError(response.error);
          setProducts([]);
        } else {
          setProducts(response.data?.data?.products ?? []);
          setPagination(response.data?.data?.pagination ?? null);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load products');
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  return { products, pagination, loading, error };
}
