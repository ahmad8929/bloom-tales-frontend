import { api } from './client';
import type { ShippingAddress } from '@/types/order';

export const paymentApi = {
  // Create Cashfree payment session
  createCashfreeSession: (data: {
    shippingAddress: ShippingAddress;
    couponCode?: string;
    emi?: { provider: string; tenureMonths: number };
  }) =>
    api.post<{
      status: string;
      data: {
        paymentSessionId: string;
        orderId: string;
        orderNumber: string;
        amount: number;
      };
    }>('/payments/cashfree/create-session', data),

  // Verify payment status
  verifyPayment: (orderId: string) =>
    api.get<{
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
