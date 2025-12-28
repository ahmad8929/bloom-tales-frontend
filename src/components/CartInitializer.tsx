'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

/**
 * CartInitializer - Fetches cart data when user is authenticated
 * This ensures the cart count in the header is accurate on app load
 * Also listens for cart update events to keep the count synchronized
 */
export function CartInitializer() {
  const { fetchCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Fetch cart on initial load when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Listen for cart update events to refresh cart data
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleCartUpdate = () => {
      // Small delay to ensure server has processed the update
      setTimeout(() => {
        fetchCart();
      }, 300);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isAuthenticated, fetchCart]);

  return null; // This component doesn't render anything
}

