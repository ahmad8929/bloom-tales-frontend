'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Banknote, CreditCard } from 'lucide-react';
import { useCheckoutContext } from '../checkout-context';
import { useCouponUI } from '@/hooks/useCouponUI';
import { useEmiQuote } from '@/hooks/useEmiQuote';
import { EmiPlanSelector } from '@/components/checkout/EmiPlanSelector';
import { CheckoutStepIndicator } from '@/components/checkout/CheckoutStepIndicator';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { resolveCheckoutPricing } from '@/lib/checkout/pricing';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const {
    cart, checkoutState, pricing, applyCoupon, selectPaymentMethod,
    selectedEmiPlan, setSelectedEmiPlan,
  } = useCheckoutContext();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cashfree'>('cashfree');
  const [isContinuing, setIsContinuing] = useState(false);

  const coupon = useCouponUI(applyCoupon, cart, checkoutState?.couponCode);

  // Step guard: an address must be chosen before selecting a payment method.
  useEffect(() => {
    if (checkoutState === null) return;
    if (!checkoutState.addressId && !checkoutState.inlineAddress) {
      router.replace('/checkout/address');
    }
  }, [checkoutState, router]);

  // Adopt whatever payment method is already persisted server-side.
  useEffect(() => {
    if (checkoutState?.paymentMethod) {
      setPaymentMethod(checkoutState.paymentMethod === 'COD' ? 'cod' : 'cashfree');
    }
  }, [checkoutState?.paymentMethod]);

  useEffect(() => {
    if (paymentMethod !== 'cashfree') setSelectedEmiPlan(null);
  }, [paymentMethod, setSelectedEmiPlan]);

  const pricingData = resolveCheckoutPricing(cart, pricing, paymentMethod, coupon.localCouponDiscount);
  const { emiSupported, plans: emiPlans } = useEmiQuote(pricingData.totalAmount, paymentMethod === 'cashfree');

  const handleContinue = async () => {
    setIsContinuing(true);
    await selectPaymentMethod(paymentMethod === 'cod' ? 'COD' : 'ONLINE');
    setIsContinuing(false);
    router.push('/checkout/review');
  };

  if (!cart) return null;

  return (
    <>
      <CheckoutStepIndicator currentStep="payment" />

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Payment Method</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value === 'cod' ? 'cod' : 'cashfree')}
                className="space-y-3"
              >
                <label
                  htmlFor="cod"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    paymentMethod === 'cod' ? 'border-gold bg-gold-soft/40' : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" className="mt-1" />
                  <Banknote className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" />
                  <div className="flex-1">
                    <span className="cursor-pointer font-medium text-sm sm:text-base">Cash on Delivery (COD)</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Pay in cash when your order arrives.</p>
                    <AnimatePresence initial={false}>
                      {paymentMethod === 'cod' && (
                        <motion.div
                          key="cod-advance-note"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-md border border-gold/30 bg-white p-3">
                            <p className="text-sm font-semibold text-heading">Cash on Delivery (COD)</p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                              A small advance payment is collected online to confirm your COD order (you&apos;ll see the exact amount on the next step).
                            </p>
                            <p className="mt-2 text-xs font-semibold leading-relaxed text-heading sm:text-sm">
                              The remaining amount is paid in cash when your order is delivered.
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                              This helps us prevent fake COD orders. Thank you for your understanding. 💖
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </label>
                <label
                  htmlFor="cashfree"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    paymentMethod === 'cashfree' ? 'border-gold bg-gold-soft/40' : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="cashfree" id="cashfree" className="mt-1" />
                  <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" />
                  <div className="flex-1">
                    <span className="cursor-pointer font-medium text-sm sm:text-base">Secure Online Payment</span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Instant confirmation via UPI, Cards, Net Banking, or Wallets.</p>
                  </div>
                </label>
              </RadioGroup>

              {paymentMethod === 'cashfree' && emiSupported && (
                <EmiPlanSelector plans={emiPlans} selected={selectedEmiPlan} onSelect={setSelectedEmiPlan} />
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" className="flex-1 text-xs sm:text-sm md:text-base" size="lg" onClick={() => router.push('/checkout/delivery')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="flex-1 text-xs sm:text-sm md:text-base" size="lg" onClick={handleContinue} disabled={isContinuing}>
              Continue to Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <OrderSummaryCard
            cart={cart}
            pricingData={pricingData}
            couponCode={coupon.couponCode}
            setCouponCode={coupon.setCouponCode}
            effectiveCouponCode={coupon.effectiveCouponCode}
            isValidatingCoupon={coupon.isValidatingCoupon}
            couponError={coupon.couponError}
            onValidateCoupon={coupon.handleValidateCoupon}
            onRemoveCoupon={coupon.handleRemoveCoupon}
          />
        </div>
      </div>
    </>
  );
}
