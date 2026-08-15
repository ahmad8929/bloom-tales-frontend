'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useCheckout } from '@/hooks/useCheckout';
import type { CartData } from '@/types/checkout-ui';

export interface SelectedEmiPlan {
  provider: string;
  tenureMonths: number;
}

interface CheckoutContextValue extends ReturnType<typeof useCheckout> {
  cart: CartData | null;
  isLoadingCart: boolean;
  refetchCart: () => Promise<void>;
  // EMI plan choice isn't persisted server-side (only sent at final payment-
  // session creation), so it has to be carried across the payment → review
  // page navigation as client state instead.
  selectedEmiPlan: SelectedEmiPlan | null;
  setSelectedEmiPlan: (plan: SelectedEmiPlan | null) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

/**
 * Fetches cart + checkout-state ONCE per checkout visit and shares it across
 * all four /checkout/* pages via Next.js's shared layout (this provider
 * lives in layout.tsx, which persists across client-side navigation between
 * sibling routes) — avoids every step re-fetching the same data on mount.
 */
export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<SelectedEmiPlan | null>(null);
  const checkout = useCheckout();

  const refetchCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);
      const response = await cartApi.getCart();
      if (response.error) throw new Error(response.error);
      setCart((response.data?.data?.cart as CartData) || null);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({ title: 'Error', description: 'Failed to load cart items', variant: 'destructive' });
      router.push('/cart');
    } finally {
      setIsLoadingCart(false);
    }
  }, [router]);

  useEffect(() => {
    refetchCart();
    checkout.fetchState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CheckoutContext.Provider value={{ ...checkout, cart, isLoadingCart, refetchCart, selectedEmiPlan, setSelectedEmiPlan }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckoutContext must be used within CheckoutProvider (src/app/checkout/layout.tsx)');
  return ctx;
}

/**
 * Shared loading/empty-cart gate for every /checkout/* page — mirrors the
 * old single-page checkout's early-return behavior, centralized once instead
 * of duplicated across four route files.
 */
export function CheckoutLoadingGuard({ children }: { children: React.ReactNode }) {
  const { cart, isLoadingCart, isLoading: isCheckoutLoading } = useCheckoutContext();

  if (isLoadingCart || isCheckoutLoading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-border border-t-gold" />
        <p className="mt-5 font-sans text-xs uppercase tracking-luxe text-text-muted">Preparing your checkout…</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto max-w-md border border-dashed border-border px-6 py-16">
          <p className="mb-3 font-display text-3xl">Your bag is empty</p>
          <p className="mb-8 text-sm text-text-muted">Add some pieces to proceed with checkout.</p>
          <a href="/products" className="inline-block rounded-md bg-gold px-6 py-2.5 text-sm font-medium text-white">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
