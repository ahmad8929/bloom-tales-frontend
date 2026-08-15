'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCheckoutContext } from './checkout-context';

/**
 * Bare /checkout is now just an entry point that forwards to whichever step
 * the backend's checkout-state says is current (address/delivery/payment/
 * review) — the four real pages live under /checkout/<step>.
 */
export default function CheckoutEntryPage() {
  const router = useRouter();
  const { checkoutState, isLoading } = useCheckoutContext();

  useEffect(() => {
    if (isLoading) return;
    const step = checkoutState?.step || 'address';
    router.replace(`/checkout/${step}`);
  }, [checkoutState, isLoading, router]);

  // Safety net: if checkout-state never resolves (backend unavailable),
  // don't strand the user on a blank page — send them to the first step.
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/checkout/address'), 4000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );
}
