import { getCookie, removeCookie } from './utils';
import type { AuthResponse } from '@/types/auth';

const API_URL = "https://bloom-backend-rtch.onrender.com";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Global token cache to handle race conditions between Redux and cookies
let tokenCache: string | null = null;

// Function to get token from multiple sources (cookies first, then cache)
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first (most reliable)
  const cookieToken = getCookie('auth-token');
  if (cookieToken) {
    tokenCache = cookieToken; // Update cache
    return cookieToken;
  }
  
  // cache if cookie not available yet
  if (tokenCache) {
    return tokenCache;
  }
  
  return null;
}

// Function to set token cache (called from auth hooks)
export function setAuthTokenCache(token: string | null) {
  tokenCache = token;
}

// Enhanced fetch with timeout and retry logic
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again');
    }
    throw error;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Get token from multiple sources (cookies first, then cache)
      const token = getAuthToken();
      
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
      } else {
        // Log when token is missing for debugging
        if (typeof window !== 'undefined' && endpoint.includes('/cart')) {
          console.warn('Cart API call without token:', endpoint);
        }
      }

      const response = await fetchWithTimeout(`${API_URL}/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
        mode: 'cors',
      }, 30000);

      // Handle non-JSON responses gracefully
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          throw new Error('Invalid server response format');
        }
      } else {
        // If not JSON, return a generic error
        throw new Error(`Unexpected response format from server`);
      }
      
      // Check for error status in response body (even if response.ok is true)
      if (data && data.status === 'error') {
        const errorMessage = data.message || data.error || 'An error occurred';
        
        // Handle token expiration specifically
        if (errorMessage.toLowerCase().includes('token has expired') || 
            errorMessage.toLowerCase().includes('token expired') ||
            errorMessage.toLowerCase().includes('expired')) {
          
          // Clear auth state and redirect to login
          if (typeof window !== 'undefined') {
            setAuthTokenCache(null);
            
            // Clear cookies
            removeCookie('auth-token');
            removeCookie('user-role');
            
            // Dispatch custom event for auth system to handle logout
            window.dispatchEvent(new CustomEvent('authTokenExpired', {
              detail: { message: errorMessage }
            }));
            
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/login?expired=true';
            }, 100);
          }
          
          throw new Error('Your session has expired. Please log in again.');
        }
        
        // Handle other error statuses
        throw new Error(errorMessage);
      }
      
      if (!response.ok) {
        // Handle 401 Unauthorized - token might be expired or invalid
        if (response.status === 401) {
          // Clear token cache and cookies on 401
          if (typeof window !== 'undefined') {
            setAuthTokenCache(null);
            
            // Clear cookies
            removeCookie('auth-token');
            removeCookie('user-role');
            
            // Dispatch custom event for auth system to handle logout
            window.dispatchEvent(new CustomEvent('authTokenExpired', {
              detail: { message: data.message || 'Authentication required' }
            }));
            
            // Redirect to login
            setTimeout(() => {
              window.location.href = '/login?expired=true';
            }, 100);
          }
          throw new Error(data.message || 'Authentication required. Please log in again.');
        }
        // Handle 403 Forbidden - Access denied
        if (response.status === 403) {
          const errorMsg = data.message || data.error || 'Access denied';
          throw new Error(errorMsg);
        }
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return { data };
    } catch (error: any) {
      lastError = error;
      console.error(`API Error (attempt ${attempt + 1}/${retries + 1}):`, error);

      // Handle token expiration errors - don't retry
      if (error.message?.toLowerCase().includes('expired') || 
          error.message?.toLowerCase().includes('session has expired')) {
        break;
      }

      // Don't retry on client errors (4xx) or auth errors
      if (error.message?.includes('401') || error.message?.includes('403') || 
          error.message?.includes('400') || error.message?.includes('404')) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Return user-friendly error messages
  const errorMessage = lastError?.message || 'An unknown error occurred';
  let userFriendlyMessage = errorMessage;

  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    userFriendlyMessage = 'Network error - please check your connection and try again';
  } else if (errorMessage.includes('Failed to fetch')) {
    userFriendlyMessage = 'Unable to reach server - please try again later';
  }

  return {
    error: userFriendlyMessage,
  };
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
  // Existing functions
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Login failed');
        (error as any).response = { data };
        throw error;
      }

      return { data };
    } catch (error) {
      throw error;
    }
  },

  register: async (signupData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Signup failed');
        (error as any).response = { data };
        throw error;
      }

      return { data };
    } catch (error) {
      throw error;
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to resend verification');
        (error as any).response = { data };
        throw error;
      }

      return { data };
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.message || 'Token refresh failed' };
      }

      return { data: data.data };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  },
  
  // NEW OTP-based password reset functions
  sendResetOTP: async (data: { email: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/send-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Failed to send OTP');
        (error as any).response = { data: responseData };
        throw error;
      }

      return { data: responseData };
    } catch (error) {
      throw error;
    }
  },

  verifyResetOTP: async (data: { email: string; otp: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Failed to verify OTP');
        (error as any).response = { data: responseData };
        throw error;
      }

      return { data: responseData };
    } catch (error) {
      throw error;
    }
  },

  resetPasswordWithToken: async (data: { resetToken: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        const error = new Error(responseData.message || 'Failed to reset password');
        (error as any).response = { data: responseData };
        throw error;
      }

      return { data: responseData };
    } catch (error) {
      throw error;
    }
  },

  // Keep existing functions for backward compatibility
  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (token: string, data: { password: string }) =>
    api.post<{ message: string }>(`/auth/reset-password/${token}`, data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email/${token}`),

  getProfile: () => api.get<AuthResponse>('/auth/me'),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<AuthResponse>('/auth/update-password', data),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),
};

// UPDATED productApi with FIXED category endpoints
export const productApi = {
  // Get all products with enhanced logging
  getAllProducts: (params?: Record<string, string | number>) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    console.log('🔍 API CALL:', `/products${queryString ? `?${queryString}` : ''}`);
    
    return api.get<{ 
      status: string;
      data: { 
        products: any[]; 
        pagination?: any;
      } 
    }>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // FIXED: Get all categories - correct endpoint
  getCategories: () => {
    console.log('🔍 CATEGORIES API CALL:', '/products/categories');
    return api.get<{
      status: string;
      data: {
        categories: Array<{
          name: string;
          count: number;
          slug: string;
        }>;
        metadata?: {
          totalProducts: number;
          productsWithoutCategory: number;
        };
      };
    }>('/products/categories');
  },

  // FIXED: Get products by category - correct endpoint structure
  getProductsByCategory: (categoryId: string, params?: Record<string, string | number>) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/categories/${categoryId}${queryString ? `?${queryString}` : ''}`;
    console.log('🔍 CATEGORY API CALL:', endpoint);
    
    return api.get<{
      status: string;
      data: {
        products: any[];
        category: string;
        pagination?: any;
      };
    }>(endpoint);
  },

  // Alternative method using products endpoint with category filter (fallback)
  getProductsByCategoryFallback: (categoryName: string, params?: Record<string, string | number>) => {
    const allParams = {
      category: categoryName,
      ...params
    };
    
    const queryParams = new URLSearchParams();
    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/products?${queryParams.toString()}`;
    console.log('🔍 CATEGORY FALLBACK API CALL:', endpoint);
    
    return api.get<{
      status: string;
      data: {
        products: any[];
        pagination?: any;
      };
    }>(endpoint);
  },

  // Existing methods...
  getProduct: (id: string) =>
    api.get(`/products/${id}`),

  createProduct: (formData: FormData) =>
    api.post('/products', formData),

  updateProduct: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData),

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),

  searchProducts: (query: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/products/search?${params.toString()}`);
  },

  getNewArrivals: (limit = 10) =>
    api.get(`/products/new-arrivals?limit=${limit}`),

  getSaleProducts: (limit = 10) =>
    api.get(`/products/sale?limit=${limit}`),

  getProductsBySize: (size: string) => 
    productApi.getAllProducts({ size }),
};

// Updated Admin APIs with order approval functionality
export const adminApi = {
  getDashboard: () => api.get<{
    status: string;
    data: {
      stats: {
        totalOrders: number;
        pendingApprovals: number;
        totalUsers: number;
        totalProducts: number;
        recentOrders: any[];
        ordersByStatus: Record<string, number>;
        revenue: {
          totalRevenue: number;
          averageOrderValue: number;
        };
      };
    };
  }>('/admin/dashboard'),
  
  // Customer management
  getCustomers: (params?: string) => 
    api.get<{
      status: string;
      data: {
        customers: Array<{
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
          role: string;
          isEmailVerified: boolean; // Note: backend uses isEmailVerified, not emailVerified
          isActive: boolean;
          createdAt: string;
          lastLogin?: string; // Note: backend uses lastLogin, not lastLoginAt
          orderCount: number;
          totalSpent: number;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    }>(`/admin/customers${params ? `?${params}` : ''}`),
  
  // Fixed - backend expects isEmailVerified field
  toggleEmailVerification: (customerId: string, isEmailVerified: boolean) =>
    api.patch<{
      status: string;
      message: string;
      data: { user: any };
    }>(`/admin/customers/${customerId}/email-verification`, { isEmailVerified }),
  
  // This one is correct
  updateUserRole: (customerId: string, role: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { user: any };
    }>(`/admin/customers/${customerId}/role`, { role }),
  
  // Enhanced Order management with approval functionality
  getOrders: (params?: string) =>
    api.get<{
      status: string;
      data: {
        orders: Array<{
          _id: string;
          orderNumber: string;
          user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          status: string;
          paymentStatus: string;
          adminApproval: {
            status: 'pending' | 'approved' | 'rejected';
            approvedBy?: {
              _id: string;
              firstName: string;
              lastName: string;
            };
            rejectedBy?: {
              _id: string;
              firstName: string;
              lastName: string;
            };
            approvedAt?: string;
            rejectedAt?: string;
            remarks?: string;
          };
          totalAmount: number;
          items: Array<{
            _id: string;
            product: {
              _id: string;
              name: string;
              images: Array<{ url: string }>;
            };
            quantity: number;
            price: number;
          }>;
          createdAt: string;
          shippingAddress: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            pincode: string;
          };
          paymentMethod: string;
          paymentDetails?: {
            payerName?: string;
            transactionId?: string;
            paymentDate?: string;
            paymentTime?: string;
            amount?: number;
            paymentProof?: {
              url: string;
              publicId: string;
              uploadedAt: string;
            };
          };
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    }>(`/admin/orders${params ? `?${params}` : ''}`),
  
  getOrder: (orderId: string) =>
    api.get<{
      status: string;
      data: {
        order: {
          _id: string;
          orderNumber: string;
          user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            phone?: string;
          };
          status: string;
          paymentStatus: string;
          adminApproval: {
            status: 'pending' | 'approved' | 'rejected';
            approvedBy?: {
              _id: string;
              firstName: string;
              lastName: string;
            };
            rejectedBy?: {
              _id: string;
              firstName: string;
              lastName: string;
            };
            approvedAt?: string;
            rejectedAt?: string;
            remarks?: string;
          };
          totalAmount: number;
          items: Array<{
            _id: string;
            product: {
              _id: string;
              name: string;
              images: Array<{ url: string }>;
              price: number;
              size: string;
              material: string;
            };
            quantity: number;
            price: number;
            size?: string;
          }>;
          shippingAddress: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            pincode: string;
            nearbyPlaces?: string;
          };
          paymentMethod: string;
          paymentDetails?: {
            payerName?: string;
            transactionId?: string;
            paymentDate?: string;
            paymentTime?: string;
            amount?: number;
            paymentProof?: {
              url: string;
              publicId: string;
              uploadedAt: string;
            };
          };
          timeline: Array<{
            status: string;
            note: string;
            timestamp: string;
            updatedBy: {
              _id: string;
              firstName: string;
              lastName: string;
            };
          }>;
          createdAt: string;
          updatedAt: string;
          trackingNumber?: string;
          estimatedDelivery?: string;
        };
      };
    }>(`/admin/orders/${orderId}`),
  
  // New approval endpoints
  approveOrder: (orderId: string, remarks?: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: any };
    }>(`/admin/orders/${orderId}/approve`, { remarks }),
  
  rejectOrder: (orderId: string, remarks: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: any };
    }>(`/admin/orders/${orderId}/reject`, { remarks }),
  
  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: any };
    }>(`/admin/orders/${orderId}/status`, { status, note }),

  // Get orders by specific user
  getOrdersByUser: (userId: string, params?: string) =>
    api.get<{
      status: string;
      data: {
        user: {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
        orders: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    }>(`/admin/users/${userId}/orders${params ? `?${params}` : ''}`),
};

// Cart APIs
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
        }
      } 
    }>('/cart'),

  // Add item to cart
  addToCart: (productId: string, quantity: number = 1, size?: string, color?: { name: string; hexCode: string } | null, material?: string) => {
    console.log('🔵 cartApi.addToCart called with:', { 
      productId, 
      quantity, 
      size, 
      color, 
      material, 
      materialType: typeof material,
      materialIsUndefined: material === undefined,
      materialIsNull: material === null,
      materialValue: material,
      materialLength: material?.length 
    });
    
    const payload: any = {
      productId,
      quantity
    };
    
    if (size) {
      payload.size = size;
    }
    
    if (color) {
      payload.color = color;
    }
    
    // Always include material if it's a non-empty string
    // Check explicitly for string type and non-empty after trim
    if (material !== undefined && material !== null && typeof material === 'string') {
      const trimmedMaterial = material.trim();
      if (trimmedMaterial.length > 0) {
        payload.material = trimmedMaterial;
        console.log('✅ Material added to payload:', trimmedMaterial);
      } else {
        console.log('⚠️ Material is empty string, not adding to payload');
      }
    } else {
      console.log('⚠️ Material not included - undefined, null, or not a string:', { material, type: typeof material });
    }
    
    console.log('📦 Final Cart API payload:', JSON.stringify(payload, null, 2));
    
    return api.post<{ 
      status: string;
      message: string;
      data: { 
        cart: any;
        item: any;
      } 
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
      } 
    }>(`/cart/update/${itemId}`, { quantity }),

  // Remove item from cart
  removeFromCart: (itemId: string) =>
    api.delete<{ 
      status: string;
      message: string;
      data: { 
        cart: any 
      } 
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
      }
    }>('/cart/summary'),
};

// Enhanced Order APIs with new flow
export const orderApi = {
  // Create order with enhanced payment details
  createOrder: (data: {
    shippingAddress: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      nearbyPlaces?: string;
    };
    paymentMethod: string;
    paymentDetails?: {
      payerName: string;
      transactionId?: string;
      paymentDate: string;
      paymentTime: string;
      amount: number;
    };
    couponCode?: string;
  }) => api.post<{ 
    status: string;
    message: string;
    data: {
      order: {
        _id: string;
        orderNumber: string;
        userId: string;
        items: Array<{
          _id: string;
          productId: string;
          quantity: number;
          price: number;
          size?: string;
          product: {
            _id: string;
            name: string;
            price: number;
            images: Array<{ url: string; alt?: string }>;
            size: string;
            material: string;
            slug?: string;
          };
        }>;
        totalAmount: number;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        paymentDetails?: {
          payerName: string;
          transactionId?: string;
          paymentDate: string;
          paymentTime: string;
          amount: number;
        };
        shippingAddress: any;
        createdAt: string;
        updatedAt: string;
        estimatedDelivery?: string;
        trackingNumber?: string;
      };
    };
  }>('/orders/create', data),

  // Get user's orders with category support
  getOrders: (category?: 'ongoing' | 'completed' | 'cancelled', page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    return api.get<{ 
      status: string;
      data: {
        orders: Array<{
          _id: string;
          orderNumber: string;
          userId: string;
          items: Array<{
            _id: string;
            productId: string;
            quantity: number;
            price: number;
            size?: string;
            product: {
              _id: string;
              name: string;
              price: number;
              images: Array<{ url: string; alt?: string }>;
              size: string;
              material: string;
              slug?: string;
            };
          }>;
          totalAmount: number;
          status: 'awaiting_approval' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
          paymentMethod: string;
          paymentStatus: 'pending' | 'completed' | 'failed';
          adminApproval: {
            status: 'pending' | 'approved' | 'rejected';
            remarks?: string;
          };
          paymentDetails?: {
            payerName: string;
            transactionId?: string;
            paymentDate: string;
            paymentTime: string;
            amount: number;
          };
          shippingAddress: {
            fullName: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            pincode: string;
            nearbyPlaces?: string;
          };
          createdAt: string;
          updatedAt: string;
          estimatedDelivery?: string;
          trackingNumber?: string;
          category: 'ongoing' | 'completed' | 'cancelled';
        }>;
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
    }>(`/orders${params.toString() ? `?${params.toString()}` : ''}`);
  },

  // Get single order by ID
  getOrder: (orderId: string) => api.get<{
    status: string;
    data: {
      order: {
        _id: string;
        orderNumber: string;
        userId: string;
        items: Array<{
          _id: string;
          productId: string;
          quantity: number;
          price: number;
          size?: string;
          product: {
            _id: string;
            name: string;
            price: number;
            images: Array<{ url: string; alt?: string }>;
            size: string;
            material: string;
            slug?: string;
          };
        }>;
        totalAmount: number;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        adminApproval: {
          status: 'pending' | 'approved' | 'rejected';
          remarks?: string;
        };
        paymentDetails?: {
          payerName: string;
          transactionId?: string;
          paymentDate: string;
          paymentTime: string;
          amount: number;
        };
        shippingAddress: any;
        createdAt: string;
        updatedAt: string;
        estimatedDelivery?: string;
        trackingNumber?: string;
      };
    };
  }>(`/orders/${orderId}`),

  // Cancel order (only for ongoing orders)
  cancelOrder: (orderId: string, reason?: string) => api.post<{ 
    status: string;
    message: string;
    data: {
      order: any;
    };
  }>(`/orders/${orderId}/cancel`, { reason }),

  // Track order with admin approval status
  trackOrder: (orderId: string) => api.get<{ 
    status: string;
    data: {
      tracking: {
        orderId: string;
        orderNumber: string;
        status: string;
        adminApproval: {
          status: 'pending' | 'approved' | 'rejected';
          remarks?: string;
        };
        trackingNumber?: string;
        estimatedDelivery?: string;
        trackingHistory: Array<{
          status: string;
          note: string;
          timestamp: string;
          updatedBy?: {
            _id: string;
            firstName: string;
            lastName: string;
          };
        }>;
      };
    };
  }>(`/orders/${orderId}/track`),

  // Get order statistics with new categories
  getOrderStats: () => api.get<{
    status: string;
    data: {
      stats: {
        total: number;
        ongoing: number;
        completed: number;
        cancelled: number;
        totalValue: number;
      };
    };
  }>('/orders/stats'),

  // Get order invoice
  getOrderInvoice: (orderId: string) =>
    api.get<{
      status: string;
      data: {
        invoice: {
          invoiceNumber: string;
          orderId: string;
          invoiceDate: string;
          dueDate: string;
          items: Array<any>;
          subtotal: number;
          tax: number;
          total: number;
          downloadUrl?: string;
        };
      };
    }>(`/orders/${orderId}/invoice`),
};

// Payment APIs
export const paymentApi = {
  // Create Cashfree payment session
  createCashfreeSession: (data: {
    shippingAddress: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      nearbyPlaces?: string;
    };
    couponCode?: string;
  }) => api.post<{
    status: string;
    data: {
      paymentSessionId: string;
      orderId: string;
      orderNumber: string;
      amount: number;
    };
  }>('/payments/cashfree/create-session', data),

  // Verify payment status
  verifyPayment: (orderId: string) => api.get<{
    status: string;
    data: {
      order: any;
      paymentStatus: string;
    };
  }>(`/payments/cashfree/verify/${orderId}`),

  verifyPaymentByOrderNumber: (orderNumber: string) =>
  api.get<{
    status: string;
    data: {
      order: any;
      paymentStatus: 'pending' | 'completed' | 'failed';
    };
  }>(`/payments/cashfree/verify-by-number/${orderNumber}`),

};


// Profile APIs
export const profileApi = {
  // Get user profile
  getProfile: () => api.get<{
    status: string;
    data: {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        age?: number;
        gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
        role: string;
        avatar?: string;
        bio?: string;
        dateOfBirth?: string;
        lastLogin?: string;
        addresses: Array<{
          _id: string;
          fullName: string;
          phone: string;
          street: string;
          city: string;
          state: string;
          zipCode: string;
          country: string;
          nearbyPlaces?: string;
          isDefault: boolean;
          addressType: 'home' | 'work' | 'other';
        }>;
        createdAt: string;
        updatedAt: string;
      };
    };
  }>('/profile'),

  // Update user profile
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  }) => api.put<{
    status: string;
    message: string;
    data: {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        age?: number;
        gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
        role: string;
        avatar?: string;
        bio?: string;
        dateOfBirth?: string;
        lastLogin?: string;
        addresses: Array<any>;
        createdAt: string;
        updatedAt: string;
      };
    };
  }>('/profile', data),

  // Get all addresses
  getAddresses: () => api.get<{
    status: string;
    data: {
      addresses: Array<{
        _id: string;
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        nearbyPlaces?: string;
        isDefault: boolean;
        addressType: 'home' | 'work' | 'other';
      }>;
    };
  }>('/profile/addresses'),

  // Add new address
  addAddress: (data: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    nearbyPlaces?: string;
    isDefault?: boolean;
    addressType?: 'home' | 'work' | 'other';
  }) => api.post<{
    status: string;
    message: string;
    data: {
      address: {
        _id: string;
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        nearbyPlaces?: string;
        isDefault: boolean;
        addressType: 'home' | 'work' | 'other';
      };
    };
  }>('/profile/addresses', data),

  // Update address
  updateAddress: (addressId: string, data: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    nearbyPlaces?: string;
    isDefault?: boolean;
    addressType?: 'home' | 'work' | 'other';
  }) => api.put<{
    status: string;
    message: string;
    data: {
      address: {
        _id: string;
        fullName: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        nearbyPlaces?: string;
        isDefault: boolean;
        addressType: 'home' | 'work' | 'other';
      };
    };
  }>(`/profile/addresses/${addressId}`, data),

  // Delete address
  deleteAddress: (addressId: string) => api.delete<{
    status: string;
    message: string;
  }>(`/profile/addresses/${addressId}`),
};

// Coupon APIs
export const couponApi = {
  // Validate coupon code
  validateCoupon: (code: string, subtotal: number) => {
    const params = new URLSearchParams({
      code,
      subtotal: subtotal.toString()
    });
    return api.get<{
      status: string;
      message: string;
      data: {
        coupon: {
          code: string;
          description?: string;
          discountType: 'percentage' | 'fixed';
          discountValue: number;
          minPurchaseAmount: number;
          maxDiscountAmount?: number;
        };
        discount: {
          discountAmount: number;
          finalAmount: number;
        };
      };
    }>(`/coupons/validate?${params.toString()}`);
  },

  // Admin: Create coupon
  createCoupon: (data: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validUntil: string;
    usageLimit?: number;
    userUsageLimit?: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
  }) => api.post<{
    status: string;
    message: string;
    data: { coupon: any };
  }>('/coupons', data),

  // Admin: Get all coupons
  getCoupons: (params?: string) => api.get<{
    status: string;
    data: {
      coupons: Array<{
        _id: string;
        code: string;
        description?: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        minPurchaseAmount: number;
        maxDiscountAmount?: number;
        validFrom: string;
        validUntil: string;
        usageLimit?: number;
        usageCount: number;
        userUsageLimit: number;
        isActive: boolean;
        totalDiscountGiven: number;
        isExpired: boolean;
        isCurrentlyValid: boolean;
        createdAt: string;
        createdBy: {
          _id: string;
          firstName: string;
          lastName: string;
          email: string;
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }>(`/coupons${params ? `?${params}` : ''}`),

  // Admin: Get single coupon
  getCoupon: (couponId: string) => api.get<{
    status: string;
    data: {
      coupon: {
        _id: string;
        code: string;
        description?: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        minPurchaseAmount: number;
        maxDiscountAmount?: number;
        validFrom: string;
        validUntil: string;
        usageLimit?: number;
        usageCount: number;
        userUsageLimit: number;
        isActive: boolean;
        totalDiscountGiven: number;
        usageHistory: Array<{
          orderNumber: string;
          orderAmount: number;
          discountAmount: number;
          user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          usedAt: string;
        }>;
        createdAt: string;
      };
    };
  }>(`/coupons/${couponId}`),

  // Admin: Update coupon
  updateCoupon: (couponId: string, data: {
    description?: string;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validUntil?: string;
    usageLimit?: number;
    userUsageLimit?: number;
    isActive?: boolean;
    applicableCategories?: string[];
    applicableProducts?: string[];
  }) => api.put<{
    status: string;
    message: string;
    data: { coupon: any };
  }>(`/coupons/${couponId}`, data),

  // Admin: Delete coupon
  deleteCoupon: (couponId: string) => api.delete<{
    status: string;
    message: string;
  }>(`/coupons/${couponId}`),

  // Admin: Get coupon analytics
  getCouponAnalytics: (params?: string) => api.get<{
    status: string;
    data: {
      analytics: Array<{
        _id: string;
        code: string;
        discountType: string;
        discountValue: number;
        usageCount: number;
        usageLimit?: number;
        validFrom: string;
        validUntil: string;
        isActive: boolean;
        totalDiscountGiven: number;
        totalOrders: number;
        totalRevenue: number;
        createdAt: string;
      }>;
      overallStats: {
        totalCoupons: number;
        activeCoupons: number;
        expiredCoupons: number;
        totalUsage: number;
        totalDiscountGiven: number;
        totalOrders: number;
        totalRevenue: number;
      };
    };
  }>(`/coupons/analytics${params ? '?' + params : ''}`),
};
