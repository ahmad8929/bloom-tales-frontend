import { Product } from './product';

export interface WishlistItem {
  productId: string;
  product: Product;
  createdAt: string;
}

export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
} 