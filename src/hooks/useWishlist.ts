'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bloomtales-wishlist';
const WISHLIST_EVENT = 'wishlistUpdated';

function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Client-side wishlist persisted to localStorage.
 * All hook instances stay in sync via a custom window event.
 */
export function useWishlist() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(readWishlist());
    const sync = () => setItems(readWishlist());
    window.addEventListener(WISHLIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((productId: string) => {
    const current = readWishlist();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(WISHLIST_EVENT));
    return next.includes(productId);
  }, []);

  const has = useCallback((productId: string) => items.includes(productId), [items]);

  return { items, count: items.length, toggle, has };
}
