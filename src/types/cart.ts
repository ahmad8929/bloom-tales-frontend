import type { Product, ProductColor } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: ProductColor;
}

export interface CartResponse {
  cart: {
    items: CartItem[];
    total: number;
    subtotal: number;
    tax?: number;
    shipping?: number;
  };
}

export interface ProductResponse {
  product: Product;
}

// Legacy interface for compatibility - can be removed later
export interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}