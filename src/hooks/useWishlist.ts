'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  setLoading,
  setError,
  setWishlistItems,
  addToWishlistLocal,
  removeFromWishlistLocal,
  clearWishlistLocal,
} from '@/store/slices/wishlistSlice';
import { wishlistApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types/product';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const itemCount = items.length;

  // Fetch wishlist from server
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch(setLoading(true));
      const response = await wishlistApi.getWishlist();
      
      if (response.data?.wishlist?.items) {
        dispatch(setWishlistItems(response.data.wishlist.items));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to fetch wishlist'));
      console.error('Error fetching wishlist:', error);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (product: Product) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await wishlistApi.addToWishlist(product.id);
        
        if (response.data?.wishlist?.items) {
          dispatch(setWishlistItems(response.data.wishlist.items));
        }
      } else {
        dispatch(addToWishlistLocal(product));
      }
      
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to add to wishlist'));
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await wishlistApi.removeFromWishlist(productId);
        
        if (response.data?.wishlist?.items) {
          dispatch(setWishlistItems(response.data.wishlist.items));
        }
      } else {
        dispatch(removeFromWishlistLocal(productId));
      }
      
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to remove from wishlist'));
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist.',
        variant: 'destructive',
      });
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return items.some(item => item.id === productId);
  };

  // Clear wishlist
  const clearWishlist = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearWishlistLocal());
      
      toast({
        title: 'Wishlist cleared',
        description: 'All items have been removed from your wishlist.',
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to clear wishlist'));
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist.',
        variant: 'destructive',
      });
    }
  };

  return {
    items,
    loading,
    error,
    itemCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    fetchWishlist,
  };
};