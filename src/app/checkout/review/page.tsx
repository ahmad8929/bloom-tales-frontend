'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { paymentApi, profileApi, settingsApi } from '@/lib/api';
import { useCheckoutContext } from '../checkout-context';
import { useCouponUI } from '@/hooks/useCouponUI';
import { CheckoutStepIndicator } from '@/components/checkout/CheckoutStepIndicator';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { resolveCheckoutPricing } from '@/lib/checkout/pricing';
import { openCashfreeCheckout } from '@/lib/checkout/cashfreeCheckout';

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { cart, checkoutState, pricing, resolvedAddress, applyCoupon, selectedEmiPlan } = useCheckoutContext();

  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codAdvanceAmount, setCodAdvanceAmount] = useState(250); // display estimate only — backend is authoritative

  const paymentMethod: 'cod' | 'cashfree' = checkoutState?.paymentMethod === 'COD' ? 'cod' : 'cashfree';
  const coupon = useCouponUI(applyCoupon, cart, checkoutState?.couponCode);

  useEffect(() => {
    profileApi.getProfile().then((res) => {
      if (res.data?.data?.user?.email) setUserEmail(res.data.data.user.email);
    });
    settingsApi.getCharges().then((res) => {
      if (res.data?.data?.settings?.codAdvanceAmount != null) {
        setCodAdvanceAmount(res.data.data.settings.codAdvanceAmount);
      }
    });
  }, []);

  // Step guard: address and payment method must both be set before review.
  useEffect(() => {
    if (checkoutState === null) return;
    if (!checkoutState.addressId && !checkoutState.inlineAddress) {
      router.replace('/checkout/address');
      return;
    }
    if (!checkoutState.paymentMethod) {
      router.replace('/checkout/payment');
    }
  }, [checkoutState, router]);

  if (!cart) return null;

  const pricingData = resolveCheckoutPricing(cart, pricing, paymentMethod, coupon.localCouponDiscount);
  const advanceAmount = Math.min(codAdvanceAmount, pricingData.totalAmount);
  const remainingAmount = Math.max(0, pricingData.totalAmount - advanceAmount);

  const buildShippingAddress = () => {
    if (!resolvedAddress) return null;
    return {
      fullName: resolvedAddress.fullName,
      email: userEmail,
      phone: resolvedAddress.phone,
      address: resolvedAddress.street,
      city: resolvedAddress.city,
      state: resolvedAddress.state,
      pincode: resolvedAddress.zipCode,
      nearbyPlaces: resolvedAddress.nearbyPlaces || '',
    };
  };

  const handleSubmitOrder = async () => {
    const shippingAddress = buildShippingAddress();
    if (!shippingAddress) {
      toast({ title: 'Address Required', description: 'Please select a delivery address', variant: 'destructive' });
      router.push('/checkout/address');
      return;
    }
    if (!userEmail) {
      toast({ title: 'Email Required', description: 'Please ensure your email is set in your profile', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = paymentMethod === 'cod'
        ? await paymentApi.createCodAdvanceSession({
            shippingAddress,
            ...(coupon.effectiveCouponCode && { couponCode: coupon.effectiveCouponCode }),
          })
        : await paymentApi.createCashfreeSession({
            shippingAddress,
            ...(coupon.effectiveCouponCode && { couponCode: coupon.effectiveCouponCode }),
            ...(selectedEmiPlan && { emi: selectedEmiPlan }),
          });

      if (response.error) throw new Error(response.error);

      const paymentSessionId = response.data?.data?.paymentSessionId;
      if (!paymentSessionId) throw new Error('Failed to create payment session');

      await openCashfreeCheckout(paymentSessionId);
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CheckoutStepIndicator currentStep="review" />

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          {resolvedAddress && (
            <Card>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-luxe text-text-muted">Delivering to</p>
                <p className="text-sm font-medium sm:text-base">{resolvedAddress.fullName}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {resolvedAddress.street}, {resolvedAddress.city}, {resolvedAddress.state} - {resolvedAddress.zipCode}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">Phone: {resolvedAddress.phone}</p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'cod' && (
            <Card className="border-gold/30 bg-gold-soft/20">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <p className="text-sm font-semibold text-heading">Cash on Delivery — advance payment required</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Pay online now</span>
                  <span className="font-semibold">₹{advanceAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Due in cash at delivery</span>
                  <span>₹{remainingAmount.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-2.5 p-3 sm:space-y-3 sm:p-4 md:p-6">
              <Button className="w-full text-xs sm:text-sm md:text-base" size="lg" onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">Processing...</span>
                  </div>
                ) : (
                  <span className="break-words">
                    {paymentMethod === 'cod'
                      ? `Pay ₹${advanceAmount.toLocaleString('en-IN')} to Confirm Order`
                      : `Place Order - ₹${pricingData.totalAmount.toLocaleString('en-IN')}`}
                  </span>
                )}
              </Button>

              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 sm:p-3">
                <p className="text-center text-[10px] leading-relaxed text-destructive sm:text-xs">
                  <strong>No Returns:</strong> All products are non-returnable
                </p>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full text-xs sm:text-sm md:text-base" size="lg" onClick={() => router.push('/checkout/payment')} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment
          </Button>
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
            disabled={isSubmitting}
          />
        </div>
      </div>
    </>
  );
}
