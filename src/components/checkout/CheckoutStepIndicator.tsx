'use client';

import { useRouter } from 'next/navigation';
import { CHECKOUT_STEPS, type CheckoutStep } from '@/types/checkout-ui';

/**
 * Real route navigation (unlike the old single-page version's scroll-to-id).
 * Clicking any step navigates directly — the destination page itself
 * redirects back if its own preconditions aren't met yet (see each page's
 * step-guard effect), so this component doesn't need to know completion state.
 */
export function CheckoutStepIndicator({ currentStep }: { currentStep: CheckoutStep }) {
  const router = useRouter();
  const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto mb-6 flex max-w-7xl items-center gap-1.5 sm:gap-2 md:mb-8" role="list" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((step, index) => (
        <button
          key={step.key}
          type="button"
          role="listitem"
          onClick={() => router.push(step.path)}
          className="flex flex-1 flex-col items-center gap-1 text-center"
        >
          <span
            className={`h-1.5 w-full rounded-full transition-colors ${
              index <= currentIndex ? 'bg-gold' : 'bg-border'
            }`}
          />
          <span className={`text-[10px] uppercase tracking-luxe sm:text-xs ${index <= currentIndex ? 'text-heading' : 'text-text-muted'}`}>
            {step.label}
          </span>
        </button>
      ))}
    </div>
  );
}
