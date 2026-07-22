import { api } from './client';

export interface CheckoutInlineAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  landmark?: string;
}

export interface CheckoutPricing {
  subtotal: number;
  automaticDiscount: number;
  couponDiscount: number;
  couponCode: string | null;
  totalDiscount: number;
  subtotalAfterDiscount: number;
  deliveryFee: number;
  platformFee: number;
  packagingFee: number;
  convenienceFee: number;
  customCharges: Array<{ name: string; code: string; amount: number }>;
  tax: number;
  totalAmount: number;
}

export interface CheckoutStateData {
  _id: string;
  addressId: string | null;
  inlineAddress: CheckoutInlineAddress | null;
  couponCode: string | null;
  deliverySlot: { date?: string; window?: string };
  paymentMethod: 'COD' | 'ONLINE' | null;
  paymentGateway: 'none' | 'cashfree' | 'razorpay' | 'stripe' | 'payu';
  step: 'address' | 'delivery' | 'payment' | 'review';
  lastPricingSnapshot: (CheckoutPricing & { computedAt: string }) | null;
}

interface CheckoutStateEnvelope {
  status: string;
  data: { checkout: CheckoutStateData };
}

interface CheckoutSnapshotEnvelope {
  status: string;
  data: { checkout: CheckoutStateData; cart: any; address: any; pricing: CheckoutPricing };
}

export const checkoutApi = {
  getState: () => api.get<CheckoutSnapshotEnvelope>('/checkout'),

  getReview: () => api.get<CheckoutSnapshotEnvelope>('/checkout/review'),

  setAddress: (body: { addressId: string } | { inlineAddress: CheckoutInlineAddress }) =>
    api.put<CheckoutStateEnvelope>('/checkout/address', body),

  setDeliverySlot: (body: { date?: string; window?: string }) =>
    api.put<CheckoutStateEnvelope>('/checkout/delivery', body),

  setCoupon: (couponCode: string | null) =>
    api.put<{ status: string; message: string; data: { checkout: CheckoutStateData; pricing: CheckoutPricing } }>(
      '/checkout/coupon',
      { couponCode }
    ),

  setPaymentMethod: (body: { paymentMethod: 'COD' | 'ONLINE'; paymentGateway?: 'none' | 'cashfree' }) =>
    api.put<CheckoutStateEnvelope>('/checkout/payment-method', body),

  reset: () => api.delete<{ status: string; message: string }>('/checkout'),
};
