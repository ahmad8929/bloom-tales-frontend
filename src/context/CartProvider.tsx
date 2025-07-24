'use client';

import { createContext, useReducer, useEffect } from 'react';
import type { CartState, CartItem } from '@/types/cart';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING' }
  | { type: 'SET_ITEMS'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isLoading: true,
  error: null
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS': {
      return { ...state, items: action.payload, isLoading: false };
    }
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.productId === action.payload.productId && 
          item.size === action.payload.size &&
          item.color?.hexCode === action.payload.color?.hexCode
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM': {
      return { ...state, items: state.items.filter(item => item.productId !== action.payload) };
    }
    case 'UPDATE_QUANTITY': {
      return { ...state, items: state.items.map(item => 
        item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
      )};
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    case 'SET_ERROR': {
      return { ...state, error: action.payload, isLoading: false };
    }
    case 'START_LOADING': {
      return { ...state, isLoading: true };
    }
    case 'FINISH_LOADING': {
      return { ...state, isLoading: false };
    }
    default:
      return state;
  }
}

export const CartContext = createContext<(CartState & {
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotals: () => { subtotal: number; shipping: number; tax: number; total: number };
  itemCount: number;
}) | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        dispatch({ type: 'START_LOADING' });
        const { data, error } = await cartApi.getCart();
        if (error) throw new Error(error);
        if (data?.cart) {
          dispatch({ type: 'SET_ITEMS', payload: data.cart.items });
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
        toast({
          title: 'Error',
          description: 'Failed to load your cart. Please try again.',
          variant: 'destructive',
        });
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    } else {
      dispatch({ type: 'FINISH_LOADING' });
    }
  }, []);

  const addToCart = async (item: CartItem) => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { data, error } = await cartApi.addToCart(item.productId, item.quantity);
      if (error) throw new Error(error);
      if (data?.cart) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart.items });
        toast({
          title: 'Added to cart',
          description: `${item.product.name} has been added to your cart.`,
        });
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { data, error } = await cartApi.removeFromCart(productId);
      if (error) throw new Error(error);
      if (data?.cart) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart.items });
        toast({
          title: 'Removed from cart',
          description: 'Item has been removed from your cart.',
        });
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { data, error } = await cartApi.updateCartItem(productId, quantity);
      if (error) throw new Error(error);
      if (data?.cart) {
        dispatch({ type: 'SET_ITEMS', payload: data.cart.items });
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart' });
      toast({
        title: 'Error',
        description: 'Failed to update cart. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const clearCart = async () => {
    try {
      dispatch({ type: 'START_LOADING' });
      const { error } = await cartApi.clearCart();
      if (error) throw new Error(error);
      dispatch({ type: 'CLEAR_CART' });
      toast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared.',
      });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      toast({
        title: 'Error',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getCartTotals = () => {
    const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total
    };
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotals,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
