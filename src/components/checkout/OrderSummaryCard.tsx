'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, ShoppingBag, X } from 'lucide-react';
import type { CartData } from '@/types/checkout-ui';
import type { CheckoutPricing } from '@/lib/api/checkout';

interface OrderSummaryCardProps {
  cart: CartData;
  pricingData: CheckoutPricing;
  couponCode: string;
  setCouponCode: (v: string) => void;
  effectiveCouponCode: string | null;
  isValidatingCoupon: boolean;
  couponError: string | null;
  onValidateCoupon: () => void;
  onRemoveCoupon: () => void;
  disabled?: boolean;
}

/** Shared across all four /checkout/* pages so the running total is always visible. */
export function OrderSummaryCard({
  cart,
  pricingData,
  couponCode,
  setCouponCode,
  effectiveCouponCode,
  isValidatingCoupon,
  couponError,
  onValidateCoupon,
  onRemoveCoupon,
  disabled,
}: OrderSummaryCardProps) {
  const {
    subtotal, automaticDiscount, couponDiscount, deliveryFee,
    platformFee, packagingFee, convenienceFee, tax, customCharges, totalAmount,
  } = pricingData;

  return (
    <Card className="lg:sticky lg:top-4 h-fit">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span>Order Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
        <div className="space-y-1.5 sm:space-y-2 md:space-y-3 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto -mx-1 px-1">
          {cart.items.map(item => (
            <div key={item._id} className="flex gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 border rounded-lg bg-muted/20">
              <div className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0">
                <Image
                  src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 640px) 36px, (max-width: 768px) 40px, 48px"
                />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs sm:text-sm font-medium line-clamp-2 break-words">{item.product.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  Qty: {item.quantity} • Size: {item.size || item.product.size}
                </p>
              </div>
              <p className="text-xs sm:text-sm font-medium flex-shrink-0 self-start">
                ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          {!effectiveCouponCode ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') onValidateCoupon();
                }}
                disabled={isValidatingCoupon || disabled}
                className="text-xs sm:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onValidateCoupon}
                disabled={isValidatingCoupon || !couponCode.trim() || disabled}
                className="flex-shrink-0"
              >
                {isValidatingCoupon ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-sage/40 bg-sage/10 p-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-sage-deep" />
                <span className="text-xs sm:text-sm font-medium text-sage-deep">{effectiveCouponCode}</span>
                <Badge variant="outline" className="border-sage/40 bg-sage/15 text-[10px] text-sage-deep sm:text-xs">
                  -₹{couponDiscount.toLocaleString('en-IN')}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveCoupon}
                disabled={disabled}
                className="h-6 w-6 p-0 text-sage-deep hover:text-heading"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
        </div>

        <Separator />

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
            <span className="break-words">Subtotal ({cart.totalItems} items)</span>
            <span className="flex-shrink-0 ml-2">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {automaticDiscount > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span className="font-medium text-sage-deep">Discount {subtotal > 20000 ? '(10%)' : '(4%)'}</span>
              <span className="ml-2 flex-shrink-0 font-medium text-sage-deep">-₹{automaticDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span className="font-medium text-sage-deep">Coupon Discount ({effectiveCouponCode})</span>
              <span className="ml-2 flex-shrink-0 font-medium text-sage-deep">-₹{couponDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
            <span>Shipping</span>
            <span className="flex-shrink-0 ml-2">
              {deliveryFee === 0 ? <span className="font-medium text-sage-deep">Free</span> : `₹${deliveryFee.toLocaleString('en-IN')}`}
            </span>
          </div>

          {platformFee > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span>Platform Fee</span>
              <span className="flex-shrink-0 ml-2">₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          {packagingFee > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span>Packaging Fee</span>
              <span className="flex-shrink-0 ml-2">₹{packagingFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          {convenienceFee > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span>Convenience Fee</span>
              <span className="flex-shrink-0 ml-2">₹{convenienceFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span>Tax</span>
              <span className="flex-shrink-0 ml-2">₹{tax.toLocaleString('en-IN')}</span>
            </div>
          )}
          {customCharges?.map((charge) => (
            <div key={charge.code} className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
              <span>{charge.name}</span>
              <span className="flex-shrink-0 ml-2">₹{charge.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}

          <Separator />
          <div className="flex justify-between items-center gap-2 text-sm sm:text-base md:text-lg font-semibold pt-1">
            <span>Total Amount</span>
            <span className="flex-shrink-0 ml-2">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
