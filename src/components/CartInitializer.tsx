'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

/**
 * CartInitializer - Fetches cart data when user is authenticated
 * This ensures the cart count in the header is accurate on app load
 * Also listens for cart update events to keep the count synchronized
 */
export function CartInitializer() {
  const { fetchCart, mergeGuestCart } = useCart();
  const { isAuthenticated } = useAuth();
  const hasInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mergeInProgressRef = useRef(false);

  // Debounced fetch cart function
  const debouncedFetchCart = useCallback(() => {
    if (isFetchingRef.current) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (!isFetchingRef.current) {
        isFetchingRef.current = true;
        fetchCart().finally(() => {
          isFetchingRef.current = false;
        });
      }
    }, 1000); // 1 second debounce to prevent excessive API calls
  }, [fetchCart]);

  // Fetch cart on initial load when authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Check if merge is already in progress (from LoginForm)
      const mergeInProgress = typeof window !== 'undefined' && (window as any).__cartMergeInProgress;
      mergeInProgressRef.current = mergeInProgress || false;
      
      // Wait longer if merge is in progress (LoginForm handles it)
      // Otherwise, check if we need to merge guest cart
      const checkMergeDelay = mergeInProgress ? 2500 : 800;
      
      const timer = setTimeout(() => {
        // If merge was in progress, it should be done by now, just fetch
        if (mergeInProgressRef.current) {
          debouncedFetchCart();
          return;
        }
        
        // Check if there are guest cart items to merge first
        try {
          const persistedState = localStorage.getItem('persist:root');
          if (persistedState) {
            const parsed = JSON.parse(persistedState);
            const cartState = parsed.cart ? JSON.parse(parsed.cart) : null;
            const hasGuestItems = cartState?.items && Array.isArray(cartState.items) && cartState.items.length > 0;
            
            if (hasGuestItems) {
              // Merge guest cart first, then fetch
              mergeInProgressRef.current = true;
              mergeGuestCart()
                .finally(() => {
                  mergeInProgressRef.current = false;
                })
                .catch(() => {
                  // If merge fails, just fetch the server cart
                  debouncedFetchCart();
                });
              return;
            }
          }
        } catch (error) {
          console.error('Error checking guest cart:', error);
        }
        
        // No guest items, just fetch the server cart
        debouncedFetchCart();
      }, checkMergeDelay);
      
      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      hasInitializedRef.current = false;
      mergeInProgressRef.current = false;
    }
  }, [isAuthenticated, mergeGuestCart, debouncedFetchCart]);

  // Listen for cart update events to refresh cart data (with debouncing)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleCartUpdate = () => {
      debouncedFetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isAuthenticated, debouncedFetchCart]);

  return null; // This component doesn't render anything
}

