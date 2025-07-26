'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import {
  setLoading,
  setError,
  setCartItems,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  clearCartLocal,
} from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { CartItem } from '@/types/cart';

export const useCart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Fetch cart from server
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch(setLoading(true));
      const response = await cartApi.getCart();
      
      if (response.data?.cart?.items) {
        dispatch(setCartItems(response.data.cart.items));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to fetch cart'));
      console.error('Error fetching cart:', error);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        // Add to server cart
        const response = await cartApi.addToCart(productId, quantity);
        
        if (response.data?.cart?.items) {
          dispatch(setCartItems(response.data.cart.items));
          toast({
            title: 'Added to cart',
            description: 'Item has been added to your cart.',
          });
        }
      } else {
        // For guest users, we need to fetch product details first
        // This is a simplified version - you might want to improve this
        toast({
          title: 'Please login',
          description: 'Please log in to add items to your cart.',
          action: {
            label: 'Login',
            onClick: () => router.push('/login'),
          },
        });
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to add to cart'));
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await cartApi.updateCartItem(productId, quantity);
        
        if (response.data?.cart?.items) {
          dispatch(setCartItems(response.data.cart.items));
        }
      } else {
        dispatch(updateCartItemLocal({ productId, quantity }));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to update cart'));
      toast({
        title: 'Error',
        description: 'Failed to update cart item.',
        variant: 'destructive',
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await cartApi.removeFromCart(productId);
        
        if (response.data?.cart?.items) {
          dispatch(setCartItems(response.data.cart.items));
        }
      } else {
        dispatch(removeFromCartLocal(productId));
      }
      
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart.',
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to remove from cart'));
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart.',
        variant: 'destructive',
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        await cartApi.clearCart();
        dispatch(setCartItems([]));
      } else {
        dispatch(clearCartLocal());
      }
      
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to clear cart'));
      toast({
        title: 'Error',
        description: 'Failed to clear cart.',
        variant: 'destructive',
      });
    }
  };

  // Merge guest cart with user cart on login
  const mergeGuestCart = async () => {
    // This would be called after login to merge any guest cart items
    // Implementation depends on how you want to handle this
  };

  return {
    cartItems: items,
    loading,
    error,
    itemCount,
    totalPrice,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    mergeGuestCart,
  };
};