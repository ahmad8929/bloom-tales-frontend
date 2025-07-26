import type { Product } from './product';

export interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

export interface WishlistResponse {
  wishlist: {
    items: Product[];
    createdAt: string;
    updatedAt: string;
  };
}