'use client';

import { useState, useCallback, useRef } from 'react';
import { checkoutApi, CheckoutStateData, CheckoutPricing } from '@/lib/api/checkout';

export function useCheckout() {
  const [checkoutState, setCheckoutState] = useState<CheckoutStateData | null>(null);
  const [pricing, setPricing] = useState<CheckoutPricing | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);
  // Once the checkout-state API proves unreachable (e.g. not deployed on
  // this backend environment yet), stop retrying it on every interaction —
  // the checkout page falls back to local calculations instead. A later
  // successful call clears this, in case the backend comes online.
  const unavailableRef = useRef(false);

  const fetchState = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const res = await checkoutApi.getState();
      if (res.error) throw new Error(res.error);
      const d = res.data?.data;
      if (d) {
        setCheckoutState(d.checkout);
        setPricing(d.pricing);
        setResolvedAddress(d.address);
        unavailableRef.current = false;
      }
    } catch (error) {
      console.error('Checkout-state API unavailable, using local fallback:', error);
      unavailableRef.current = true;
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const selectAddress = useCallback(async (addressId: string) => {
    if (unavailableRef.current) return false;
    const res = await checkoutApi.setAddress({ addressId });
    if (res.error) {
      console.error('Failed to persist checkout address:', res.error);
      return false;
    }
    if (res.data?.data?.checkout) setCheckoutState(res.data.data.checkout);
    // Delivery fee can depend on address (city-based rules), so re-pull pricing.
    await fetchState();
    return true;
  }, [fetchState]);

  const selectDeliverySlot = useCallback(async (date?: string, windowLabel?: string) => {
    if (unavailableRef.current) return false;
    const res = await checkoutApi.setDeliverySlot({ date, window: windowLabel });
    if (res.error) {
      console.error('Failed to persist delivery slot:', res.error);
      return false;
    }
    if (res.data?.data?.checkout) setCheckoutState(res.data.data.checkout);
    return true;
  }, []);

  const applyCoupon = useCallback(async (code: string | null) => {
    if (unavailableRef.current) return { success: false as const, error: 'unavailable' };
    const res = await checkoutApi.setCoupon(code);
    if (res.error) return { success: false as const, error: res.error };
    if (res.data?.data) {
      setCheckoutState(res.data.data.checkout);
      setPricing(res.data.data.pricing);
      return { success: true as const, pricing: res.data.data.pricing };
    }
    return { success: true as const, pricing: null };
  }, []);

  const selectPaymentMethod = useCallback(async (method: 'COD' | 'ONLINE') => {
    if (unavailableRef.current) return false;
    const res = await checkoutApi.setPaymentMethod({
      paymentMethod: method,
      paymentGateway: method === 'ONLINE' ? 'cashfree' : 'none',
    });
    if (res.error) {
      console.error('Failed to persist payment method:', res.error);
      return false;
    }
    if (res.data?.data?.checkout) setCheckoutState(res.data.data.checkout);
    // Delivery fee is waived for online payment, so re-pull pricing.
    await fetchState();
    return true;
  }, [fetchState]);

  const resetCheckout = useCallback(async () => {
    if (unavailableRef.current) return;
    await checkoutApi.reset();
    setCheckoutState(null);
    setPricing(null);
    setResolvedAddress(null);
  }, []);

  return {
    checkoutState,
    pricing,
    resolvedAddress,
    isLoading,
    fetchState,
    selectAddress,
    selectDeliverySlot,
    applyCoupon,
    selectPaymentMethod,
    resetCheckout,
  };
}
