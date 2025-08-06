import { getCookie } from './utils';
import type { AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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


// Add these new functions to your existing authApi object

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
      const response = await fetch(`${API_URL}/api/auth/signup`, {
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
  addToCart: (productId: string, quantity: number = 1, size?: string) =>
    api.post<{ 
      status: string;
      message: string;
      data: { 
        cart: any;
        item: any;
      } 
    }>('/cart/add', { 
      productId, 
      quantity,
      ...(size && { size })
    }),

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
      transactionId: string;
      paymentDate: string;
      paymentTime: string;
      amount: number;
    };
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
        adminApproval: {
          status: 'pending' | 'approved' | 'rejected';
        };
        paymentDetails?: {
          payerName: string;
          transactionId: string;
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
            transactionId: string;
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
          transactionId: string;
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

  // Upload payment proof
  uploadPaymentProof: (orderId: string, formData: FormData) =>
    api.post<{
      status: string;
      message: string;
      data: {
        order: any;
        paymentProof: {
          url: string;
          publicId: string;
          uploadedAt: string;
        };
      };
    }>(`/orders/${orderId}/payment-proof`, formData),

  // Update payment details
  updatePaymentDetails: (orderId: string, paymentDetails: any) =>
    api.patch<{
      status: string;
      message: string;
      data: {
        order: any;
      };
    }>(`/orders/${orderId}/payment-details`, { paymentDetails }),

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