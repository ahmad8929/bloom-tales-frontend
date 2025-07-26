import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types/cart';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addToCartLocal: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.product.id === action.payload.product.id
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    updateCartItemLocal: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.product.id === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setCartItems,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  clearCartLocal,
} = cartSlice.actions;

export default cartSlice.reducer;