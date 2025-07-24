import { Product } from './product';

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  product: Product;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
} 