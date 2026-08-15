'use client';

import { CheckoutProvider, CheckoutLoadingGuard } from './checkout-context';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <CheckoutProvider>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-12 min-h-screen">
        <div className="text-center mb-6 sm:mb-8 md:mb-14">
          <p className="eyebrow mb-3">The final touch</p>
          <h1 className="font-display text-3xl md:text-5xl font-medium mb-2">Checkout</h1>
          <p className="text-xs sm:text-sm md:text-base text-text-muted">Complete your order details below</p>
        </div>
        <CheckoutLoadingGuard>{children}</CheckoutLoadingGuard>
      </div>
    </CheckoutProvider>
  );
}
