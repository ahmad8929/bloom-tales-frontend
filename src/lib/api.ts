import { getCookie } from './utils';
import type { AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from cookie for client-side requests
    const token = typeof window !== 'undefined' ? getCookie('auth-token') : null;
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
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
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch: <T>(endpoint: string, data: any, options?: RequestInit) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/signup', data),

  getProfile: () => api.get<AuthResponse>('/auth/me'),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<AuthResponse>('/auth/update-password', data),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),

  refreshToken: (refreshToken: string) => 
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', { refreshToken }),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (token: string, data: { password: string }) =>
    api.post<{ message: string }>(`/auth/reset-password/${token}`, data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email/${token}`),

  resendVerification: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/resend-verification', data),
};

// Product APIs matching your backend structure
export const productApi = {
  // Get all products with optional query parameters
  getAllProducts: (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return api.get<{ 
      status: string;
      data: { 
        products: any[]; 
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      } 
    }>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product by ID
  getProduct: (id: string) =>
    api.get<{ 
      status: string;
      data: { 
        product: any 
      } 
    }>(`/products/${id}`),

  // Create new product
  createProduct: (formData: FormData) =>
    api.post<{ 
      status: string;
      message: string;
      data: { 
        product: any 
      };
    }>('/products', formData),

  // Update existing product
  updateProduct: (id: string, formData: FormData) =>
    api.put<{ 
      status: string;
      message: string;
      data: { 
        product: any 
      };
    }>(`/products/${id}`, formData),

  // Delete product
  deleteProduct: (id: string) =>
    api.delete<{ 
      status: string;
      message: string;
    }>(`/products/${id}`),

  // Search products with filters
  searchProducts: (query: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get<{ 
      status: string;
      data: { 
        products: any[]; 
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      } 
    }>(`/products/search?${params.toString()}`);
  },

  // Get new arrivals
  getNewArrivals: (limit = 10) =>
    api.get<{ 
      status: string;
      data: { 
        products: any[] 
      } 
    }>(`/products/new-arrivals?limit=${limit}`),

  // Get sale products
  getSaleProducts: (limit = 10) =>
    api.get<{ 
      status: string;
      data: { 
        products: any[] 
      } 
    }>(`/products/sale?limit=${limit}`),

  // Get products by size
  getProductsBySize: (size: string) =>
    api.get<{ 
      status: string;
      data: { 
        products: any[] 
      } 
    }>(`/products?size=${size}`),

  // Get products by material
  getProductsByMaterial: (material: string) =>
    api.get<{ 
      status: string;
      data: { 
        products: any[] 
      } 
    }>(`/products?material=${encodeURIComponent(material)}`),
};

// Admin APIs
export const adminApi = {
  getDashboard: () => api.get<any>('/admin/dashboard'),
  
  // Customer management
  getCustomers: (params?: string) => 
    api.get<any>(`/admin/customers${params ? `?${params}` : ''}`),
  
  toggleEmailVerification: (customerId: string, emailVerified: boolean) =>
    api.patch<any>(`/admin/customers/${customerId}/email-verification`, { emailVerified }),
  
  updateUserRole: (customerId: string, role: string) =>
    api.patch<any>(`/admin/customers/${customerId}/role`, { role }),
  
  // Order management
  getOrders: (params?: string) =>
    api.get<any>(`/admin/orders${params ? `?${params}` : ''}`),
  
  getOrder: (orderId: string) =>
    api.get<any>(`/admin/orders/${orderId}`),
  
  updateOrderStatus: (orderId: string, status: string) =>
    api.patch<any>(`/admin/orders/${orderId}/status`, { status }),
};

// Cart APIs
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

// Order APIs
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
