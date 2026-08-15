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

  // Create a COD order's advance-confirmation payment session — charges
  // only AdminSettings.codAdvanceAmount (not the full order total); the
  // remainder is collected as cash on delivery. Same body shape as
  // createCashfreeSession (no EMI — doesn't make sense for a small advance).
  createCodAdvanceSession: (data: { shippingAddress: ShippingAddress; couponCode?: string }) =>
    api.post<{
      status: string;
      data: {
        paymentSessionId: string;
        orderId: string;
        orderNumber: string;
        advanceAmount: number;
        totalAmount: number;
        remainingAmount: number;
      };
    }>('/payments/cashfree/create-cod-advance-session', data),

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
