'use client';

import { useEffect, useRef, useState } from 'react';
import { emiApi, EmiPlanQuote } from '@/lib/api/emi';

/**
 * Fetches EMI plans for the given amount, debounced against fast total
 * changes (coupon/delivery-fee updates). Same graceful-degradation contract
 * as useCheckout: one failure hides the EMI section for the rest of the
 * session instead of retrying (e.g. the API isn't deployed on this backend
 * environment yet) — "unavailable" and "not applicable" look identical here.
 */
export function useEmiQuote(amount: number, enabled: boolean) {
  const [emiSupported, setEmiSupported] = useState(false);
  const [plans, setPlans] = useState<EmiPlanQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const unavailableRef = useRef(false);

  useEffect(() => {
    if (!enabled || !amount || amount <= 0) {
      setEmiSupported(false);
      setPlans([]);
      return;
    }
    if (unavailableRef.current) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await emiApi.getQuote(amount);
        if (cancelled) return;
        if (res.error) throw new Error(res.error);
        const d = res.data?.data;
        setEmiSupported(!!d?.emiSupported);
        setPlans(d?.plans || []);
      } catch (err) {
        if (cancelled) return;
        console.error('EMI quote unavailable, hiding EMI section:', err);
        unavailableRef.current = true;
        setEmiSupported(false);
        setPlans([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, amount]);

  return { emiSupported, plans, isLoading };
}
