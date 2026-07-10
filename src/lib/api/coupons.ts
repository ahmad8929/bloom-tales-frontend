import { api } from './client';
import type { Pagination } from '@/types/order';

export interface Coupon {
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
}

export interface CouponInput {
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
}

export const couponApi = {
  // Validate coupon code
  validateCoupon: (code: string, subtotal: number) => {
    const params = new URLSearchParams({ code, subtotal: subtotal.toString() });
    return api.get<{
      status: string;
      message: string;
      data: {
        coupon: Pick<
          Coupon,
          'code' | 'description' | 'discountType' | 'discountValue' | 'minPurchaseAmount' | 'maxDiscountAmount'
        >;
        discount: {
          discountAmount: number;
          finalAmount: number;
        };
      };
    }>(`/coupons/validate?${params.toString()}`);
  },

  // Admin: Create coupon
  createCoupon: (data: CouponInput) =>
    api.post<{
      status: string;
      message: string;
      data: { coupon: Coupon };
    }>('/coupons', data),

  // Admin: Get all coupons
  getCoupons: (params?: string) =>
    api.get<{
      status: string;
      data: {
        coupons: Coupon[];
        pagination: Pagination;
      };
    }>(`/coupons${params ? `?${params}` : ''}`),

  // Admin: Get single coupon
  getCoupon: (couponId: string) =>
    api.get<{
      status: string;
      data: {
        coupon: Coupon & {
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
        };
      };
    }>(`/coupons/${couponId}`),

  // Admin: Update coupon
  updateCoupon: (couponId: string, data: Partial<Omit<CouponInput, 'code'>> & { isActive?: boolean }) =>
    api.put<{
      status: string;
      message: string;
      data: { coupon: Coupon };
    }>(`/coupons/${couponId}`, data),

  // Admin: Delete coupon
  deleteCoupon: (couponId: string) =>
    api.delete<{
      status: string;
      message: string;
    }>(`/coupons/${couponId}`),

  // Admin: Get coupon analytics
  getCouponAnalytics: (params?: string) =>
    api.get<{
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
