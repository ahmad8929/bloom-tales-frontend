import { api } from './client';
import type { Order, OrderUserSummary, Pagination } from '@/types/order';

// Admin endpoints always populate the ordering user.
type AdminOrder = Order & { user: OrderUserSummary };

export const adminApi = {
  getDashboard: () =>
    api.get<{
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
          isEmailVerified: boolean;
          isActive: boolean;
          createdAt: string;
          lastLogin?: string;
          orderCount: number;
          totalSpent: number;
        }>;
        pagination: Pagination;
      };
    }>(`/admin/customers${params ? `?${params}` : ''}`),

  toggleEmailVerification: (customerId: string, isEmailVerified: boolean) =>
    api.patch<{
      status: string;
      message: string;
      data: { user: any };
    }>(`/admin/customers/${customerId}/email-verification`, { isEmailVerified }),

  updateUserRole: (customerId: string, role: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { user: any };
    }>(`/admin/customers/${customerId}/role`, { role }),

  // Order management with approval functionality
  getOrders: (params?: string) =>
    api.get<{
      status: string;
      data: {
        orders: AdminOrder[];
        pagination: Pagination;
      };
    }>(`/admin/orders${params ? `?${params}` : ''}`),

  getOrder: (orderId: string) =>
    api.get<{
      status: string;
      data: { order: AdminOrder };
    }>(`/admin/orders/${orderId}`),

  approveOrder: (orderId: string, remarks?: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: Order };
    }>(`/admin/orders/${orderId}/approve`, { remarks }),

  rejectOrder: (orderId: string, remarks: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: Order };
    }>(`/admin/orders/${orderId}/reject`, { remarks }),

  updateOrderStatus: (orderId: string, status: string, note?: string) =>
    api.patch<{
      status: string;
      message: string;
      data: { order: Order };
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
        orders: Order[];
        pagination: Pagination;
      };
    }>(`/admin/users/${userId}/orders${params ? `?${params}` : ''}`),
};
