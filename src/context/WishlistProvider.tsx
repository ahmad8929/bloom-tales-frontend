'use client';

import { createContext, useReducer, useEffect, ReactNode } from "react";
import type { Product } from "@/types/product";
import type { WishlistState } from "@/types/wishlist";
import { wishlistApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type WishlistAction =
  | { type: 'SET_ITEMS'; payload: WishlistState['items'] }
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: WishlistState = {
  items: [],
  isLoading: true,
  error: null
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'START_LOADING':
      return { ...state, isLoading: true };
    case 'FINISH_LOADING':
      return { ...state, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  itemCount: number;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        dispatch({ type: 'START_LOADING' });
        const { data, error } = await wishlistApi.getWishlist();
        if (error) throw new Error(error);
        if (data?.wishlist) {
          dispatch({ type: 'SET_ITEMS', payload: data.wishlist.items });
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch wishlist' });
        toast({
          title: 'Error',
          description: 'Failed to load your wishlist. Please try again.',
          variant: 'destructive',
        });
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchWishlist();
    } else {
      dispatch({ type: 'FINISH_LOADING' });
    }
  }, []);

  const addToWishlist = async (product: Product) => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { data, error } = await wishlistApi.addToWishlist(product.id);
      if (error) throw new Error(error);
      if (data?.wishlist) {
        dispatch({ type: 'SET_ITEMS', payload: data.wishlist.items });
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to wishlist' });
      toast({
        title: 'Error',
        description: 'Failed to add item to wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { data, error } = await wishlistApi.removeFromWishlist(productId);
      if (error) throw new Error(error);
      if (data?.wishlist) {
        dispatch({ type: 'SET_ITEMS', payload: data.wishlist.items });
        toast({
          title: 'Removed from wishlist',
          description: 'Item has been removed from your wishlist.',
        });
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove from wishlist' });
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const itemCount = state.items.length;

  return (
    <WishlistContext.Provider value={{
      ...state,
      addToWishlist,
      removeFromWishlist,
      itemCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
