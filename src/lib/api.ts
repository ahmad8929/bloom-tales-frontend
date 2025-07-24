const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

    // Get token from localStorage if it exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
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

// Common API methods
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

// Auth APIs
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: any }>('/auth/login', data),
  
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ token: string; user: any }>('/auth/register', data),
  
  getProfile: () => api.get<{ user: any }>('/auth/profile'),
};

// Product APIs
export const productApi = {
  getAllProducts: (query?: string) => 
    api.get<{ products: any[] }>(`/products${query ? `?${query}` : ''}`),
  
  getProduct: (id: string) => 
    api.get<{ product: any }>(`/products/${id}`),
  
  getCategories: () => 
    api.get<{ categories: any[] }>('/categories'),
  
  getProductsByCategory: (categoryId: string) =>
    api.get<{ products: any[] }>(`/categories/${categoryId}/products`),
};

// Cart APIs
export const cartApi = {
  getCart: () => api.get<{ cart: any }>('/cart'),
  
  addToCart: (productId: string, quantity: number = 1) =>
    api.post<{ cart: any }>('/cart', { productId, quantity }),
  
  updateCartItem: (productId: string, quantity: number) =>
    api.put<{ cart: any }>(`/cart/${productId}`, { quantity }),
  
  removeFromCart: (productId: string) =>
    api.delete<{ cart: any }>(`/cart/${productId}`),
  
  clearCart: () => api.delete<{ message: string }>('/cart'),
};

// Wishlist APIs
export const wishlistApi = {
  getWishlist: () => api.get<{ wishlist: any }>('/wishlist'),
  
  addToWishlist: (productId: string) =>
    api.post<{ wishlist: any }>('/wishlist', { productId }),
  
  removeFromWishlist: (productId: string) =>
    api.delete<{ wishlist: any }>(`/wishlist/${productId}`),
};

// Order APIs
export const orderApi = {
  createOrder: (data: { 
    shippingAddress: any;
    paymentMethod: string;
  }) => api.post<{ order: any }>('/orders', data),
  
  getOrders: () => api.get<{ orders: any[] }>('/orders'),
  
  getOrder: (orderId: string) => 
    api.get<{ order: any }>(`/orders/${orderId}`),
}; 