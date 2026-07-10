import { api } from './client';
import type { Order, Pagination, ShippingAddress, AdminApproval } from '@/types/order';

export const orderApi = {
  // Create order with enhanced payment details
  createOrder: (data: {
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentDetails?: {
      payerName: string;
      transactionId?: string;
      paymentDate: string;
      paymentTime: string;
      amount: number;
    };
    couponCode?: string;
  }) =>
    api.post<{
      status: string;
      message: string;
      data: { order: Order };
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
        orders: Order[];
        pagination?: Pagination;
      };
    }>(`/orders${params.toString() ? `?${params.toString()}` : ''}`);
  },

  // Get single order by ID
  getOrder: (orderId: string) =>
    api.get<{
      status: string;
      data: { order: Order };
    }>(`/orders/${orderId}`),

  // Track order with admin approval status
  trackOrder: (orderId: string) =>
    api.get<{
      status: string;
      data: {
        tracking: {
          orderId: string;
          orderNumber: string;
          status: string;
          adminApproval: AdminApproval;
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
  getOrderStats: () =>
    api.get<{
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
