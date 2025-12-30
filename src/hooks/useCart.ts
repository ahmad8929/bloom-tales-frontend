'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
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
import { cartApi, productApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

export const useCart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isFetchingRef = useRef(false);

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

const fetchCart = useCallback(async () => {
  if (!isAuthenticated) return;
  
  // Prevent multiple simultaneous fetches
  if (isFetchingRef.current) {
    return;
  }
  
  try {
    isFetchingRef.current = true;
    dispatch(setLoading(true));
    const response = await cartApi.getCart();
    
    if (response.data?.data?.cart?.items) {
      const itemsData = response.data.data.cart.items;
      // Ensure items is always an array
      if (Array.isArray(itemsData) && itemsData.length > 0) {
        // Filter out null items and items with null products, then transform
        const transformedItems = itemsData
          .filter((item: any) => item && item.product && (item._id || item.id))
          .map((item: any) => ({
            ...item,
            id: item._id || item.id, // Convert _id to id if needed
            product: {
              ...item.product,
              id: item.product._id || item.product.id, // Convert product._id to id
              description: item.product.description || '', // Provide defaults for missing fields
              careInstructions: item.product.careInstructions || [],
              isNewArrival: item.product.isNewArrival || false,
              // Add other missing fields with appropriate defaults
            }
          }));
        
        dispatch(setCartItems(transformedItems));
      } else {
        // Empty cart - set empty array
        dispatch(setCartItems([]));
      }
    } else {
      // No cart items - set empty array
      dispatch(setCartItems([]));
    }
  } catch (error: any) {
    dispatch(setError(error.message || 'Failed to fetch cart'));
    console.error('Error fetching cart:', error);
  } finally {
    dispatch(setLoading(false));
    isFetchingRef.current = false;
  }
}, [isAuthenticated, dispatch]);

  // Add item to cart
const addToCart = async (productId: string, quantity: number = 1, size?: string, color?: { name: string; hexCode: string } | null) => {
  try {
    dispatch(setLoading(true));
    
    if (isAuthenticated) {
      // Add to server cart
      const response = await cartApi.addToCart(productId, quantity, size, color);
      
      // Fix: Use consistent path to access cart items
      if (response.data?.data?.cart?.items) {
        const itemsData = response.data.data.cart.items;
        // Filter out null items and items with null products, then transform
        const transformedItems = Array.isArray(itemsData) 
          ? itemsData
              .filter((item: any) => item && item.product && (item._id || item.id))
              .map((item: any) => ({
                ...item,
                id: item._id || item.id,
                product: {
                  ...item.product,
                  id: item.product._id || item.product.id,
                  description: item.product.description || '',
                  careInstructions: item.product.careInstructions || [],
                  isNewArrival: item.product.isNewArrival || false,
                }
              }))
          : [];
        dispatch(setCartItems(transformedItems));
        toast({
          title: 'Added to cart',
          description: 'Item has been added to your cart.',
        });
      } else {
        // If response doesn't have expected structure, fetch cart to sync
        await fetchCart();
        toast({
          title: 'Added to cart',
          description: 'Item has been added to your cart.',
        });
      }
    } else {
      // For guest users, fetch product details and add to local cart
      try {
        const productResponse = await productApi.getProduct(productId);
        
        if (productResponse.error) {
          throw new Error(productResponse.error);
        }
        
        // Handle the API response structure with safe type checking
        let productData = null;
        
        // Check for nested data structure: { data: { data: { product: {...} } } }
        if (productResponse.data && typeof productResponse.data === 'object' && 'data' in productResponse.data) {
          const nestedData = (productResponse.data as any).data;
          if (nestedData && typeof nestedData === 'object' && 'product' in nestedData) {
            productData = nestedData.product;
          }
        }
        // Check for direct product in response.data: { data: { product: {...} } }
        else if (productResponse.data && typeof productResponse.data === 'object' && 'product' in (productResponse.data as any)) {
          productData = (productResponse.data as any).product;
        }
        // Check if product data is directly in response.data
        else if (productResponse.data && typeof productResponse.data === 'object') {
          productData = productResponse.data;
        }
        
        if (!productData) {
          throw new Error('Product not found');
        }

        const cartItem: CartItem = {
          product: {
            ...productData,
            id: productData._id || productData.id,
            _id: productData._id || productData.id,
          } as Product,
          quantity,
          size: size || productData.size,
          color: color || productData.color,
        };

        dispatch(addToCartLocal(cartItem));
        
        toast({
          title: 'Added to cart',
          description: 'Item has been added to your cart.',
        });
      } catch (productError: any) {
        console.error('Error fetching product for guest cart:', productError);
        throw new Error('Failed to add item to cart. Please try again.');
      }
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to add to cart';
    dispatch(setError(errorMessage));
    
    // Handle authentication errors (only for authenticated users)
    if (isAuthenticated && (errorMessage.includes('Authentication required') || errorMessage.includes('token'))) {
      toast({
        title: 'Session Expired',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      // Optionally redirect to login with returnUrl
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      }
    } else {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  } finally {
    dispatch(setLoading(false));
  }
};

  // Update cart item quantity
  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await cartApi.updateCartItem(productId, quantity);
        
        if (response.data?.data?.cart?.items) {
          dispatch(setCartItems(response.data.data.cart.items));
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
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    try {
      dispatch(setLoading(true));
      
      if (isAuthenticated) {
        const response = await cartApi.removeFromCart(productId);
        
        if (response.data?.data?.cart?.items) {
          dispatch(setCartItems(response.data.data.cart.items));
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
    } finally {
      dispatch(setLoading(false));
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
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Merge guest cart with user cart on login
  const mergeGuestCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch(setLoading(true));
      
      // Get current local cart items (guest cart) from Redux state
      const guestCartItems = items;
      
      if (guestCartItems.length === 0) {
        // No guest cart items to merge, just fetch user's cart
        await fetchCart();
        return;
      }

      // Merge guest cart items with server cart
      // For each guest cart item, add it to the server cart
      // Note: We don't fetch server cart first to avoid unnecessary API calls
      for (const guestItem of guestCartItems) {
        const productId = guestItem.product.id || guestItem.product._id;
        if (!productId) continue;

        try {
          await cartApi.addToCart(
            productId,
            guestItem.quantity,
            guestItem.size || guestItem.product.size,
            guestItem.color || guestItem.product.color
          );
        } catch (error: any) {
          console.error(`Error merging item ${productId}:`, error);
          // Continue with other items even if one fails
        }
      }

      // Fetch updated cart after merging
      await fetchCart();
      
      // Clear local cart after successful merge
      dispatch(clearCartLocal());
    } catch (error: any) {
      console.error('Error merging guest cart:', error);
      // Don't show error toast - just fetch the server cart
      await fetchCart();
    } finally {
      dispatch(setLoading(false));
    }
  }, [isAuthenticated, items, dispatch, fetchCart]);

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