import { setCookie } from './utils';
import type { AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        // Check if token needs refresh (every 10 minutes)
        const lastRefresh = localStorage.getItem('lastTokenRefresh');
        const now = Date.now();
        if (!lastRefresh || now - parseInt(lastRefresh) > 10 * 60 * 1000) {
          try {
            const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refreshToken })
            });
            
            if (refreshResponse.ok) {
              const { data } = await refreshResponse.json();
              if (data?.accessToken) {
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('lastTokenRefresh', now.toString());
                
                // Update cookies with new token
                setCookie('auth-token', data.accessToken);
                if (data.user?.role) {
                  setCookie('user-role', data.user.role);
                }
              }
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear tokens if refresh fails
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('lastTokenRefresh');
            window.location.href = '/login';
            return { error: 'Session expired' };
          }
        }
        
        // Use the latest token (refreshed or not)
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),

  post: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'DELETE',
    }),
};

// ✅ Auth APIs
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/signup', data),

  getProfile: () => api.get<AuthResponse>('/auth/me'),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<AuthResponse>('/auth/update-password', data),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),

  refreshToken: () => api.post<{ token: string }>('/auth/refresh-token', {}),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (token: string, data: { password: string }) =>
    api.post<{ message: string }>(`/auth/reset-password/${token}`, data),

  // verifyEmail: (token: string) =>
  //   api.post<{ message: string }>(`/api/auth/verify-email/${token}`, {}),
  verifyEmail: (token: string) =>
  api.get<{ message: string }>(`/auth/verify-email/${token}`, {}),


  resendVerification: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/resend-verification', data),
};

// ✅ Product APIs
export const productApi = {
  getAllProducts: (query?: string) =>
    api.get<{ products: any[] }>(`/products${query ? `?${query}` : ''}`),

  getProduct: (id: string) =>
    api.get<{ product: any }>(`/products/${id}`),

  getCategories: () =>
    api.get<{ categories: any[] }>('/categories'),

  getProductsByCategory: (categoryId: string) =>
    api.get<{ products: any[] }>(`/categories/${categoryId}/products`),

  searchProducts: (query: string) =>
    api.get<{ products: any[] }>(`/products/search?${query}`),

  getFeaturedProducts: () =>
    api.get<{ products: any[] }>('/products/featured'),
};

// ✅ Cart APIs
export const cartApi = {
  getCart: () => api.get<{ cart: any }>('/cart'),

  addToCart: (productId: string, quantity: number = 1) =>
    api.post<{ cart: any }>('/cart/add', { productId, quantity }),

  updateCartItem: (itemId: string, quantity: number) =>
    api.put<{ cart: any }>(`/cart/update/${itemId}`, { quantity }),

  removeFromCart: (itemId: string) =>
    api.delete<{ cart: any }>(`/cart/remove/${itemId}`),

  clearCart: () => api.delete<{ message: string }>('/cart/clear'),

  applyCoupon: (code: string) =>
    api.post<{ cart: any }>('/cart/apply-coupon', { code }),

  removeCoupon: () => api.delete<{ cart: any }>('/cart/remove-coupon'),
};

// ✅ Wishlist APIs
export const wishlistApi = {
  getWishlist: () => api.get<{ wishlist: any }>('/wishlist'),

  addToWishlist: (productId: string) =>
    api.post<{ wishlist: any }>('/wishlist', { productId }),

  removeFromWishlist: (productId: string) =>
    api.delete<{ wishlist: any }>(`/wishlist/${productId}`),
};

// ✅ Order APIs
export const orderApi = {
  createOrder: (data: {
    shippingAddress: any;
    paymentMethod: string;
  }) => api.post<{ order: any }>('/orders/create', data),

  getOrders: () => api.get<{ orders: any[] }>('/orders'),

  getOrder: (orderId: string) =>
    api.get<{ order: any }>(`/orders/${orderId}`),

  cancelOrder: (orderId: string) =>
    api.post<{ message: string }>(`/orders/${orderId}/cancel`, {}),

  trackOrder: (orderId: string) =>
    api.get<{ tracking: any }>(`/orders/${orderId}/track`),
};
