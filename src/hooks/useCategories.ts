'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import type { Category } from '@/types/product';

/**
 * Fetch product categories once on mount.
 * Used by the header mega-menu, mobile navigation and category pages.
 */
export function useCategories(limit?: number) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await productApi.getCategories();
        if (cancelled) return;
        const list = response.data?.data?.categories;
        if (Array.isArray(list)) {
          setCategories(limit ? list.slice(0, limit) : list);
        } else {
          setCategories([]);
        }
        setError(response.error ?? null);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error fetching categories:', err);
          setCategories([]);
          setError(err?.message ?? 'Failed to load categories');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { categories, loading, error };
}
