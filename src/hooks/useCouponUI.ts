'use client';

import { useState } from 'react';
import { couponApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import type { CartData } from '@/types/checkout-ui';

type ApplyCoupon = (code: string | null) => Promise<
  { success: true; pricing: any } | { success: false; error: string }
>;

/**
 * Coupon input + apply/remove logic, shared by every /checkout/* page that
 * renders <OrderSummaryCard>. Tries the checkout-state API first (server
 * source of truth); if that's unavailable, falls back to the legacy
 * validate-coupon endpoint with a locally-tracked discount amount.
 */
export function useCouponUI(applyCoupon: ApplyCoupon, cart: CartData | null, serverCouponCode: string | null | undefined) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [localCouponDiscount, setLocalCouponDiscount] = useState(0);

  const effectiveCouponCode = serverCouponCode ?? appliedCouponCode;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    const code = couponCode.trim().toUpperCase();
    const result = await applyCoupon(code);

    if (result.success && result.pricing) {
      toast({
        title: 'Coupon Applied!',
        description: `You saved ₹${result.pricing.couponDiscount.toLocaleString('en-IN')}`,
      });
    } else {
      try {
        const legacy = await couponApi.validateCoupon(code, cart?.totalAmount || 0);
        if (legacy.error) {
          setCouponError(legacy.error);
        } else if (legacy.data?.data?.discount) {
          setAppliedCouponCode(code);
          setLocalCouponDiscount(legacy.data.data.discount.discountAmount);
          toast({
            title: 'Coupon Applied!',
            description: `You saved ₹${legacy.data.data.discount.discountAmount.toLocaleString('en-IN')}`,
          });
        }
      } catch (error: any) {
        setCouponError(error.message || 'Invalid coupon code');
      }
    }

    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setCouponError(null);
    setAppliedCouponCode(null);
    setLocalCouponDiscount(0);
    await applyCoupon(null);
  };

  return {
    couponCode,
    setCouponCode,
    isValidatingCoupon,
    couponError,
    effectiveCouponCode,
    localCouponDiscount,
    handleValidateCoupon,
    handleRemoveCoupon,
  };
}
