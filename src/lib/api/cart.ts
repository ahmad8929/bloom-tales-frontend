import { api } from './client';
import type { ProductColor } from '@/types/product';

export const cartApi = {
  // Get user's cart
  getCart: () =>
    api.get<{
      status: string;
      data: {
        cart: {
          _id: string;
          userId: string;
          items: Array<{
            _id: string;
            productId: string;
            quantity: number;
            size?: string;
            product: {
              _id: string;
              name: string;
              price: number;
              comparePrice?: number;
              images: Array<{ url: string; alt?: string }>;
              size: string;
              material: string;
              slug?: string;
            };
          }>;
          totalItems: number;
          totalAmount: number;
          createdAt: string;
          updatedAt: string;
        };
      };
    }>('/cart'),

  // Add item to cart
  addToCart: (
    productId: string,
    quantity: number = 1,
    size?: string,
    color?: ProductColor | null,
    material?: string
  ) => {
    const payload: any = { productId, quantity };

    if (size) payload.size = size;
    if (color) payload.color = color;

    const trimmedMaterial = typeof material === 'string' ? material.trim() : '';
    if (trimmedMaterial) payload.material = trimmedMaterial;

    return api.post<{
      status: string;
      message: string;
      data: {
        cart: any;
        item: any;
      };
    }>('/cart/add', payload);
  },

  // Update cart item quantity
  updateCartItem: (itemId: string, quantity: number) =>
    api.put<{
      status: string;
      message: string;
      data: {
        cart: any;
        item: any;
      };
    }>(`/cart/update/${itemId}`, { quantity }),

  // Remove item from cart
  removeFromCart: (itemId: string) =>
    api.delete<{
      status: string;
      message: string;
      data: {
        cart: any;
      };
    }>(`/cart/remove/${itemId}`),

  // Clear entire cart
  clearCart: () =>
    api.delete<{
      status: string;
      message: string;
    }>('/cart/clear'),

  // Get cart summary (totals only)
  getCartSummary: () =>
    api.get<{
      status: string;
      data: {
        totalItems: number;
        totalAmount: number;
        itemCount: number;
      };
    }>('/cart/summary'),
};
