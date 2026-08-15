'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useCheckoutContext } from '../checkout-context';
import { useCouponUI } from '@/hooks/useCouponUI';
import { CheckoutStepIndicator } from '@/components/checkout/CheckoutStepIndicator';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { resolveCheckoutPricing } from '@/lib/checkout/pricing';
import { DELIVERY_WINDOWS } from '@/types/checkout-ui';

export default function CheckoutDeliveryPage() {
  const router = useRouter();
  const { cart, checkoutState, pricing, selectDeliverySlot, applyCoupon } = useCheckoutContext();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState<string | null>(null);
  const hasSeededRef = useRef(false);

  const coupon = useCouponUI(applyCoupon, cart, checkoutState?.couponCode);

  // Step guard: an address must be chosen before the delivery step is usable.
  useEffect(() => {
    if (checkoutState === null) return;
    if (!checkoutState.addressId && !checkoutState.inlineAddress) {
      router.replace('/checkout/address');
    }
  }, [checkoutState, router]);

  // Restore a previously chosen delivery slot into the form controls.
  useEffect(() => {
    if (hasSeededRef.current || checkoutState === null) return;
    hasSeededRef.current = true;
    if (checkoutState.deliverySlot?.date) setDeliveryDate(checkoutState.deliverySlot.date.slice(0, 10));
    if (checkoutState.deliverySlot?.window) setDeliveryWindow(checkoutState.deliverySlot.window);
  }, [checkoutState]);

  if (!cart) return null;

  const pricingData = resolveCheckoutPricing(cart, pricing, 'cod', coupon.localCouponDiscount);

  return (
    <>
      <CheckoutStepIndicator currentStep="delivery" />

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Delivery Slot</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Preferred delivery window — we&apos;ll try our best, but it isn&apos;t guaranteed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate" className="text-sm font-medium">Preferred date (optional)</Label>
                <Input
                  id="deliveryDate" type="date" min={new Date().toISOString().slice(0, 10)} value={deliveryDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDeliveryDate(value);
                    selectDeliverySlot(value ? new Date(value).toISOString() : undefined, deliveryWindow || undefined);
                  }}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred window (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_WINDOWS.map((windowLabel) => (
                    <Button
                      key={windowLabel} type="button" variant={deliveryWindow === windowLabel ? 'gold' : 'outline'} size="sm"
                      onClick={() => {
                        setDeliveryWindow(windowLabel);
                        selectDeliverySlot(deliveryDate ? new Date(deliveryDate).toISOString() : undefined, windowLabel);
                      }}
                    >
                      {windowLabel}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" className="flex-1 text-xs sm:text-sm md:text-base" size="lg" onClick={() => router.push('/checkout/address')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="flex-1 text-xs sm:text-sm md:text-base" size="lg" onClick={() => router.push('/checkout/payment')}>
              Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
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
