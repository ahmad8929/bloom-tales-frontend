// Single source of truth for the checkout total shown across all four
// /checkout/* pages. The live backend price (services/pricingService.js,
// fetched via useCheckout's `pricing`) is always authoritative when
// available; this fallback exists only for when that call hasn't resolved
// yet or the endpoint isn't reachable.
//
// IMPORTANT: the COD advance-confirmation payment (AdminSettings.codAdvanceAmount,
// see paymentController#createCodAdvanceSession) is a *portion of* the order
// total collected upfront, with the remainder due as cash on delivery — it
// must NEVER be added on top of the total as if it were a delivery fee.
// That conflation was the original bug this file replaces (previously two
// separate hand-duplicated `paymentMethod === 'cod' ? 250 : 0` blocks).
import type { CheckoutPricing } from '@/lib/api/checkout';
import type { CartData } from '@/types/checkout-ui';

// Matches AdminSettings.deliveryRule's default flat charge — only used as a
// display estimate before the live pricing call resolves; the real charge
// (and the COD advance amount) is always computed server-side at order/
// payment-session creation time.
const FALLBACK_COD_DELIVERY_FEE = 199;

export function computeFallbackPricing(cart: CartData, paymentMethod: 'cod' | 'cashfree', couponDiscount: number): CheckoutPricing {
  const subtotal = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  let automaticDiscount = 0;
  if (subtotal > 20000) automaticDiscount = Math.round(subtotal * 0.10);
  else if (subtotal > 10000) automaticDiscount = Math.round(subtotal * 0.04);

  const deliveryFee = paymentMethod === 'cod' ? FALLBACK_COD_DELIVERY_FEE : 0;
  const totalDiscount = automaticDiscount + couponDiscount;
  const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount);
  const totalAmount = subtotalAfterDiscount + deliveryFee;

  return {
    subtotal,
    automaticDiscount,
    couponDiscount,
    couponCode: null,
    totalDiscount,
    subtotalAfterDiscount,
    deliveryFee,
    platformFee: 0,
    packagingFee: 0,
    convenienceFee: 0,
    customCharges: [],
    tax: 0,
    totalAmount
  };
}

const EMPTY_CART: CartData = { _id: '', userId: '', items: [], totalItems: 0, totalAmount: 0 };

/** Live pricing wins when available; otherwise computes the same fallback formula used everywhere. */
export function resolveCheckoutPricing(
  cart: CartData | null,
  livePricing: CheckoutPricing | null,
  paymentMethod: 'cod' | 'cashfree',
  couponDiscount: number
): CheckoutPricing {
  if (livePricing) return livePricing;
  return computeFallbackPricing(cart || EMPTY_CART, paymentMethod, couponDiscount);
}
