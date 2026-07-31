'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, CreditCard, Banknote, ShoppingBag, X, Clock, Plus, Edit, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi, orderApi, profileApi, paymentApi, couponApi } from '@/lib/api';
import { validateAddressFields } from '@/lib/validation';
import { useCheckout } from '@/hooks/useCheckout';
import { useEmiQuote } from '@/hooks/useEmiQuote';
import { EmiPlanSelector } from '@/components/checkout/EmiPlanSelector';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  size?: string;
  product: {
    _id: string;
    name: string;
    price: number;
    comparePrice?: number;
    images: Array<{ url: string; alt?: string }>;
    size: string;
    material: string;
    slug?: string;
  };
}

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nearbyPlaces?: string;
  isDefault: boolean;
  addressType?: 'home' | 'work' | 'other'; // Optional - field removed from form
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const DELIVERY_WINDOWS = ['10am–1pm', '1pm–4pm', '4pm–8pm'];
const ADDRESS_FIELD_ORDER = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [userEmail, setUserEmail] = useState('');

  const {
    checkoutState,
    pricing,
    isLoading: isCheckoutLoading,
    fetchState: fetchCheckoutState,
    selectAddress: persistAddressSelection,
    selectDeliverySlot,
    applyCoupon,
    selectPaymentMethod,
    resetCheckout,
  } = useCheckout();

  // Local state is the source of truth for the UI (so checkout stays usable
  // even if the checkout-state API is unavailable); selectPaymentMethod is
  // still called as a best-effort persistence/pricing-sync side effect.
  const [paymentMethod, setPaymentMethodLocal] = useState<'cod' | 'cashfree'>('cashfree');

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState<string | null>(null);

  const hasSeededDeliveryRef = useRef(false);
  const hasReconciledAddressRef = useRef(false);

  const addressSectionRef = useRef<HTMLDivElement | null>(null);
  const addressFieldRefs = {
    fullName: useRef<HTMLInputElement | null>(null),
    phone: useRef<HTMLInputElement | null>(null),
    street: useRef<HTMLInputElement | null>(null),
    city: useRef<HTMLInputElement | null>(null),
    state: useRef<HTMLButtonElement | null>(null),
    zipCode: useRef<HTMLInputElement | null>(null),
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstKey = ADDRESS_FIELD_ORDER.find((key) => errors[key]);
    if (!firstKey) return;
    const el = addressFieldRefs[firstKey].current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  // Sync the local payment method default to the server once checkout state
  // first loads (best-effort — if the API is unavailable this silently
  // no-ops and the local default above still drives the UI).
  useEffect(() => {
    if (checkoutState === null) return;
    if (!checkoutState.paymentMethod) {
      selectPaymentMethod(paymentMethod === 'cod' ? 'COD' : 'ONLINE');
    } else {
      setPaymentMethodLocal(checkoutState.paymentMethod === 'COD' ? 'cod' : 'cashfree');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutState === null]);

  // Restore a previously chosen delivery slot into the local form controls.
  useEffect(() => {
    if (hasSeededDeliveryRef.current || checkoutState === null) return;
    hasSeededDeliveryRef.current = true;
    if (checkoutState.deliverySlot?.date) {
      setDeliveryDate(checkoutState.deliverySlot.date.slice(0, 10));
    }
    if (checkoutState.deliverySlot?.window) {
      setDeliveryWindow(checkoutState.deliverySlot.window);
    }
  }, [checkoutState]);

  // Reconcile the locally-selected address (default/first, picked by
  // fetchAddresses) with whatever was already persisted server-side, once
  // both have loaded.
  useEffect(() => {
    if (hasReconciledAddressRef.current) return;
    if (addresses.length === 0 || checkoutState === null) return;
    hasReconciledAddressRef.current = true;

    const persistedId = checkoutState.addressId;
    if (persistedId && addresses.some((a) => a._id === persistedId)) {
      setSelectedAddressId(persistedId);
    } else if (selectedAddressId) {
      persistAddressSelection(selectedAddressId);
    }
  }, [addresses, checkoutState, selectedAddressId, persistAddressSelection]);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    nearbyPlaces: '',
    isDefault: false
  });

  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Function to fetch pincode details
  const fetchPincodeDetails = useCallback(async (pincode: string) => {
    // Only fetch if pincode is 6 digits
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }

    try {
      setIsFetchingPincode(true);
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        // Get the first post office with delivery status, or first one if none have delivery
        const deliveryOffice = data[0].PostOffice.find((po: any) => po.DeliveryStatus === 'Delivery') || data[0].PostOffice[0];
        
        if (deliveryOffice) {
          setAddressForm(prev => ({
            ...prev,
            city: deliveryOffice.District || prev.city,
            state: deliveryOffice.State || prev.state,
            country: deliveryOffice.Country || prev.country || 'India'
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      // Silently fail - don't show error to user
    } finally {
      setIsFetchingPincode(false);
    }
  }, []);

  // Debounce pincode lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressForm.zipCode && addressForm.zipCode.length === 6) {
        fetchPincodeDetails(addressForm.zipCode);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [addressForm.zipCode, fetchPincodeDetails]);

  const [orderCreated, setOrderCreated] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  // Local fallback for when the checkout-state coupon endpoint is unavailable.
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [localCouponDiscount, setLocalCouponDiscount] = useState(0);
  const effectiveCouponCode = checkoutState?.couponCode ?? appliedCouponCode;

  const [selectedEmiPlan, setSelectedEmiPlan] = useState<{ provider: string; tenureMonths: number } | null>(null);

  // Mirrors the render-body fallback total formula below (hooks can't be
  // called after the early returns further down, so the amount EMI plans
  // are quoted against has to be computed here instead of reused from there).
  const checkoutTotalAmount = useMemo(() => {
    if (!cart) return 0;
    const sub = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    let autoDiscount = 0;
    if (sub > 20000) autoDiscount = Math.round(sub * 0.10);
    else if (sub > 10000) autoDiscount = Math.round(sub * 0.04);
    const deliveryFeeLocal = paymentMethod === 'cod' ? 250 : 0;
    const fallbackTotalLocal = Math.max(0, sub - autoDiscount - localCouponDiscount) + deliveryFeeLocal;
    return pricing?.totalAmount ?? fallbackTotalLocal;
  }, [cart, pricing, paymentMethod, localCouponDiscount]);

  const { emiSupported, plans: emiPlans } = useEmiQuote(checkoutTotalAmount, paymentMethod === 'cashfree');

  useEffect(() => {
    if (paymentMethod !== 'cashfree') setSelectedEmiPlan(null);
  }, [paymentMethod]);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    fetchCheckoutState();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await profileApi.getAddresses();
      if (response.error) {
        console.error('Error fetching addresses:', response.error);
        return;
      }
      const fetchedAddresses = response.data?.data?.addresses || [];
      setAddresses(fetchedAddresses);
      
      // Set default address or first address as selected
      const defaultAddress = fetchedAddresses.find((addr: Address) => addr.isDefault) || fetchedAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      }

      // Fetch user email from profile
      const profileResponse = await profileApi.getProfile();
      if (!profileResponse.error && profileResponse.data?.data?.user) {
        setUserEmail(profileResponse.data.data.user.email);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

 const fetchCart = async () => {
  try {
    setIsLoading(true);
    const response = await cartApi.getCart();
    
    if (response.error) {
      throw new Error(response.error);
    }

    const cartData = response.data?.data?.cart;

    setCart(cartData || null);
    if (cartData) {
      // Totals are derived on render; no manual payment amount tracking needed.
    }
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    toast({
      title: 'Error',
      description: 'Failed to load cart items',
      variant: 'destructive',
    });
    router.push('/cart');
  } finally {
    setIsLoading(false);
  }
};

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    const code = couponCode.trim().toUpperCase();
    const result = await applyCoupon(code);

    if (result.success && result.pricing) {
      toast({
        title: 'Coupon Applied!',
        description: `You saved ₹${result.pricing.couponDiscount.toLocaleString('en-IN')}`,
      });
    } else {
      // Checkout-state API unavailable (or this environment doesn't have it
      // deployed yet) — fall back to the legacy validate-coupon endpoint.
      try {
        const legacy = await couponApi.validateCoupon(code, cart?.totalAmount || 0);
        if (legacy.error) {
          setCouponError(legacy.error);
        } else if (legacy.data?.data?.discount) {
          setAppliedCouponCode(code);
          setLocalCouponDiscount(legacy.data.data.discount.discountAmount);
          toast({
            title: 'Coupon Applied!',
            description: `You saved ₹${legacy.data.data.discount.discountAmount.toLocaleString('en-IN')}`,
          });
        }
      } catch (error: any) {
        setCouponError(error.message || 'Invalid coupon code');
      }
    }

    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = async () => {
    setCouponCode('');
    setCouponError(null);
    setAppliedCouponCode(null);
    setLocalCouponDiscount(0);
    await applyCoupon(null);
  };

  const handleCashfreePayment = async () => {
    if (!validateForm()) return;
    if (!cart) return;

    setIsSubmitting(true);
    try {
      const selectedAddress = getSelectedAddress();
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }

      const response = await paymentApi.createCashfreeSession({
        shippingAddress: {
          fullName: selectedAddress.fullName,
          email: userEmail,
          phone: selectedAddress.phone,
          address: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.zipCode,
          nearbyPlaces: selectedAddress.nearbyPlaces || ''
        },
        ...(effectiveCouponCode && { couponCode: effectiveCouponCode }),
        ...(selectedEmiPlan && { emi: selectedEmiPlan })
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const { paymentSessionId, orderId } = response.data?.data || {};
      
      if (!paymentSessionId) {
        throw new Error('Failed to create payment session');
      }

      // Load Cashfree checkout
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        if (!window.Cashfree) {
          throw new Error('Cashfree SDK failed to load');
        }
        
        const cashfree = window.Cashfree({
  mode: 'production'
});


        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: '_self'
        });
      };
      script.onerror = () => {
        throw new Error('Failed to load Cashfree SDK');
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error('Cashfree payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      nearbyPlaces: '',
      isDefault: addresses.length === 0
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      nearbyPlaces: address.nearbyPlaces || '',
      isDefault: address.isDefault
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    const errors = validateAddressFields(addressForm);
    setAddressFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Please fix the highlighted fields',
        description: 'Some address details are missing or invalid.',
        variant: 'destructive',
      });
      scrollToFirstError(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setAddressFormErrors({});
      
      if (editingAddress) {
        const response = await profileApi.updateAddress(editingAddress._id, addressForm);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: 'Success',
          description: 'Address updated successfully',
        });
      } else {
        const response = await profileApi.addAddress(addressForm);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: 'Success',
          description: 'Address added successfully',
        });
      }

      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressFormErrors({});
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!selectedAddressId) {
      toast({
        title: 'Address Required',
        description: 'Please select or add a delivery address',
        variant: 'destructive',
      });
      addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    if (!userEmail) {
      toast({
        title: 'Email Required',
        description: 'Please ensure your email is set in your profile',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const getSelectedAddress = (): Address | null => {
    if (!selectedAddressId) return null;
    return addresses.find(addr => addr._id === selectedAddressId) || null;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    if (!cart) return;

    // Show No Returns Policy confirmation before proceeding
    // const confirmed = window.confirm(
    //   'IMPORTANT: No Returns Policy\n\n' +
    //   'All products are non-returnable. By proceeding, you acknowledge that you have read and agree to this policy.\n\n' +
    //   'Do you want to continue with your order?'
    // );

    // if (!confirmed) {
    //   return;
    // }

    // For Cashfree payment, create payment session
    if (paymentMethod === 'cashfree') {
      await handleCashfreePayment();
      return;
    }

    // COD: place order directly
    await processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedAddress = getSelectedAddress();
      if (!selectedAddress) {
        throw new Error('Please select a delivery address');
      }

      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          email: userEmail,
          phone: selectedAddress.phone,
          address: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.zipCode,
          nearbyPlaces: selectedAddress.nearbyPlaces || ''
        },
        paymentMethod: paymentMethod,
        ...(effectiveCouponCode && { couponCode: effectiveCouponCode })
      };

      const response = await orderApi.createOrder(orderData);

      if (response.error) {
        throw new Error(response.error);
      }

      const order = response.data?.data?.order;
      setOrderCreated(true);

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: 'Your order has been confirmed. A confirmation email is on its way.',
      });

      // Clear cart and checkout state after successful order
      await cartApi.clearCart();
      await resetCheckout();

      router.push(`/checkout/payment-success?order=${order?._id}&method=cod`);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Order Failed',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isCheckoutLoading) {
    return (
      <div className="container py-24">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-border border-t-gold"></div>
          <p className="mt-5 font-sans text-xs uppercase tracking-luxe text-text-muted">Preparing your checkout…</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto max-w-md border border-dashed border-border px-6 py-16">
          <ShoppingBag className="mx-auto mb-6 h-12 w-12 text-gold" strokeWidth={1} />
          <h2 className="mb-3 font-display text-3xl">Your bag is empty</h2>
          <p className="mb-8 text-sm text-text-muted">Add some pieces to proceed with checkout.</p>
          <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // The checkout-state API (live pricing/settings) may not be deployed on
  // every backend environment yet. Fall back to the same subtotal-tier
  // discount + flat COD shipping this page used before that API existed, so
  // checkout never hard-blocks if those routes 404.
  const fallbackSubtotal = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  let fallbackAutomaticDiscount = 0;
  if (fallbackSubtotal > 20000) fallbackAutomaticDiscount = Math.round(fallbackSubtotal * 0.10);
  else if (fallbackSubtotal > 10000) fallbackAutomaticDiscount = Math.round(fallbackSubtotal * 0.04);
  const fallbackDeliveryFee = paymentMethod === 'cod' ? 250 : 0;
  const fallbackCouponDiscount = localCouponDiscount;
  const fallbackTotal = Math.max(0, fallbackSubtotal - fallbackAutomaticDiscount - fallbackCouponDiscount) + fallbackDeliveryFee;

  const {
    subtotal,
    automaticDiscount,
    couponDiscount,
    deliveryFee,
    platformFee,
    packagingFee,
    convenienceFee,
    tax,
    customCharges,
    totalAmount,
  } = pricing || {
    subtotal: fallbackSubtotal,
    automaticDiscount: fallbackAutomaticDiscount,
    couponDiscount: fallbackCouponDiscount,
    deliveryFee: fallbackDeliveryFee,
    platformFee: 0,
    packagingFee: 0,
    convenienceFee: 0,
    tax: 0,
    customCharges: [] as Array<{ name: string; code: string; amount: number }>,
    totalAmount: fallbackTotal,
  };

  const currentStep = checkoutState?.step || 'address';
  const STEPS: Array<{ key: typeof currentStep; label: string }> = [
    { key: 'address', label: 'Address' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ];
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-12 min-h-screen">
      <div className="text-center mb-6 sm:mb-8 md:mb-14">
        <p className="eyebrow mb-3">The final touch</p>
        <h1 className="font-display text-3xl md:text-5xl font-medium mb-2">Checkout</h1>
        <p className="text-xs sm:text-sm md:text-base text-text-muted">Complete your order details below</p>
      </div>

      {/* Step Indicator */}
      <div className="mx-auto mb-6 flex max-w-7xl items-center gap-1.5 sm:gap-2 md:mb-8" role="list" aria-label="Checkout progress">
        {STEPS.map((step, index) => (
          <button
            key={step.key}
            type="button"
            role="listitem"
            onClick={() => {
              if (step.key === 'payment') {
                document.getElementById('payment-method-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else if (step.key === 'delivery') {
                document.getElementById('delivery-slot-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                addressSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="flex flex-1 flex-col items-center gap-1 text-center"
          >
            <span
              className={`h-1.5 w-full rounded-full transition-colors ${
                index <= currentStepIndex ? 'bg-gold' : 'bg-border'
              }`}
            />
            <span className={`text-[10px] uppercase tracking-luxe sm:text-xs ${index <= currentStepIndex ? 'text-heading' : 'text-text-muted'}`}>
              {step.label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card ref={addressSectionRef}>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="font-headline flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="break-words">Delivery Address</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">Select or add a delivery address</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAddress}
                  disabled={orderCreated}
                  className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Add Address</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg px-3">
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">No addresses saved</p>
                  <Button variant="outline" onClick={handleAddAddress} disabled={orderCreated} size="sm" className="text-xs sm:text-sm">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-2.5 sm:p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address._id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      } ${orderCreated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (orderCreated) return;
                        setSelectedAddressId(address._id);
                        persistAddressSelection(address._id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <input
                              type="radio"
                              checked={selectedAddressId === address._id}
                              onChange={() => {
                                if (orderCreated) return;
                                setSelectedAddressId(address._id);
                                persistAddressSelection(address._id);
                              }}
                              disabled={orderCreated}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
                            />
                            <span className="font-medium text-xs sm:text-sm md:text-base break-words">{address.fullName}</span>
                            {address.isDefault && (
                              <Badge variant="default" className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0">Default</Badge>
                            )}
                          </div>
                          <div className="ml-4 sm:ml-5 md:ml-6 space-y-0.5 sm:space-y-1">
                            <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                              {address.street}, {address.city}, {address.state} - {address.zipCode}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{address.country}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Phone: <span className="break-all">{address.phone}</span>
                            </p>
                            {address.nearbyPlaces && (
                              <p className="text-xs sm:text-sm text-muted-foreground break-words">
                                Landmark: {address.nearbyPlaces}
                              </p>
                            )}
                          </div>
                        </div>
                        {!orderCreated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Slot Selection */}
          <Card id="delivery-slot-section" className="mt-3 sm:mt-4 md:mt-6">
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
                  id="deliveryDate"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={deliveryDate}
                  disabled={orderCreated}
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
                      key={windowLabel}
                      type="button"
                      variant={deliveryWindow === windowLabel ? 'gold' : 'outline'}
                      size="sm"
                      disabled={orderCreated}
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

          {/* Payment Method Selection */}
          <Card id="payment-method-section" className="mt-3 sm:mt-4 md:mt-6">
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
                onValueChange={(value) => {
                  if (orderCreated) return;
                  const next = value === 'cod' ? 'cod' : 'cashfree';
                  setPaymentMethodLocal(next);
                  selectPaymentMethod(next === 'cod' ? 'COD' : 'ONLINE');
                }}
                disabled={orderCreated}
                className="space-y-3"
              >
                <label
                  htmlFor="cod"
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    paymentMethod === 'cod' ? 'border-gold bg-gold-soft/40' : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" className="mt-1" disabled={orderCreated} />
                  <Banknote className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" />
                  <div className="flex-1">
                    <span className="cursor-pointer font-medium text-sm sm:text-base">
                      Cash on Delivery (COD)
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Pay in cash when your order arrives.
                    </p>
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
                              A <strong className="text-heading">₹250 advance payment</strong> is required to confirm your COD order.
                            </p>
                            <p className="mt-2 text-xs font-semibold leading-relaxed text-heading sm:text-sm">
                              The remaining amount can be paid when your order is delivered.
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
                  <RadioGroupItem value="cashfree" id="cashfree" className="mt-1" disabled={orderCreated} />
                  <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" />
                  <div className="flex-1">
                    <span className="cursor-pointer font-medium text-sm sm:text-base">
                      Secure Online Payment
                    </span>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Instant confirmation via UPI, Cards, Net Banking, or Wallets.
                    </p>
                  </div>
                </label>
              </RadioGroup>

              {paymentMethod === 'cashfree' && emiSupported && (
                <EmiPlanSelector
                  plans={emiPlans}
                  selected={selectedEmiPlan}
                  onSelect={setSelectedEmiPlan}
                />
              )}
            </CardContent>
          </Card>

        </div>

        {/* Order Summary */}
        <div className="order-1 lg:order-2">
          <Card className="lg:sticky lg:top-4 h-fit">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-2.5 sm:space-y-3 md:space-y-4">
              {/* Order Items */}
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

              {/* Coupon Code Section */}
              <div className="space-y-2">
                {!effectiveCouponCode ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleValidateCoupon();
                        }
                      }}
                      disabled={isValidatingCoupon || orderCreated}
                      className="text-xs sm:text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim() || orderCreated}
                      className="flex-shrink-0"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-sage/40 bg-sage/10 p-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-deep" />
                      <span className="text-xs sm:text-sm font-medium text-sage-deep">
                        {effectiveCouponCode}
                      </span>
                      <Badge variant="outline" className="border-sage/40 bg-sage/15 text-[10px] text-sage-deep sm:text-xs">
                        -₹{couponDiscount.toLocaleString('en-IN')}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      disabled={orderCreated}
                      className="h-6 w-6 p-0 text-sage-deep hover:text-heading"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                  <span className="break-words">Subtotal ({cart.totalItems} items)</span>
                  <span className="flex-shrink-0 ml-2">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Automatic Discount */}
                {automaticDiscount > 0 && (
                  <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                    <span className="font-medium text-sage-deep">
                      Discount {subtotal > 20000 ? '(10%)' : '(4%)'}
                    </span>
                    <span className="ml-2 flex-shrink-0 font-medium text-sage-deep">
                      -₹{automaticDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                    <span className="font-medium text-sage-deep">
                      Coupon Discount ({effectiveCouponCode})
                    </span>
                    <span className="ml-2 flex-shrink-0 font-medium text-sage-deep">
                      -₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                  <span>Shipping</span>
                  <span className="flex-shrink-0 ml-2">
                    {deliveryFee === 0 ? (
                      <span className="font-medium text-sage-deep">Free</span>
                    ) : (
                      `₹${deliveryFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                {/* Admin-configurable fees — only rendered when active */}
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
        </div>
      </div>

      {/* Place Order — kept last in the flow on every breakpoint, after
          Address/Delivery/Payment, not tucked inside the summary sidebar. */}
      <div className="mx-auto mt-3 max-w-7xl sm:mt-4 md:mt-6">
        <Card>
          <CardContent className="space-y-2.5 p-3 sm:space-y-3 sm:p-4 md:p-6">
            {orderCreated ? (
              <div className="rounded-lg border border-sage/40 bg-sage/10 p-3 text-center sm:p-4">
                <CheckCircle className="mx-auto mb-1.5 h-6 w-6 text-sage-deep sm:mb-2 sm:h-8 sm:w-8" />
                <p className="text-xs font-semibold text-sage-deep sm:text-sm md:text-base">Order Placed Successfully!</p>
                <p className="mt-1 text-xs text-sage-deep/90 sm:text-sm">Redirecting to your order confirmation...</p>
              </div>
            ) : (
              <Button
                className="w-full text-xs sm:text-sm md:text-base"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">Processing...</span>
                  </div>
                ) : (
                  <span className="break-words">
                    {`Place Order - ₹${totalAmount.toLocaleString('en-IN')}`}
                  </span>
                )}
              </Button>
            )}

            {!orderCreated && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2 sm:p-3">
                <p className="text-center text-[10px] leading-relaxed text-destructive sm:text-xs">
                  <strong>No Returns:</strong> All products are non-returnable
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="break-words">{editingAddress ? 'Edit Address' : 'Add New Address'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              {editingAddress
                ? 'Update your address details below'
                : 'Add a new delivery address to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Personal Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressFullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="addressFullName"
                    ref={addressFieldRefs.fullName}
                    value={addressForm.fullName}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, fullName: e.target.value });
                      if (addressFormErrors.fullName) {
                        setAddressFormErrors({ ...addressFormErrors, fullName: '' });
                      }
                    }}
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                    aria-invalid={!!addressFormErrors.fullName}
                    className="text-sm sm:text-base"
                  />
                  {addressFormErrors.fullName && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressPhone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="addressPhone"
                    ref={addressFieldRefs.phone}
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAddressForm({ ...addressForm, phone: value });
                      if (addressFormErrors.phone) {
                        setAddressFormErrors({ ...addressFormErrors, phone: '' });
                      }
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    disabled={isSubmitting}
                    aria-invalid={!!addressFormErrors.phone}
                    className="text-sm sm:text-base"
                  />
                  {addressFormErrors.phone && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Address Details</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet" className="text-sm font-medium">Street Address *</Label>
                  <Input
                    id="addressStreet"
                    ref={addressFieldRefs.street}
                    value={addressForm.street}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, street: e.target.value });
                      if (addressFormErrors.street) {
                        setAddressFormErrors({ ...addressFormErrors, street: '' });
                      }
                    }}
                    placeholder="House no, Street, Area"
                    disabled={isSubmitting}
                    aria-invalid={!!addressFormErrors.street}
                    className="text-sm sm:text-base"
                  />
                  {addressFormErrors.street && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity" className="text-sm font-medium">City *</Label>
                    <Input
                      id="addressCity"
                      ref={addressFieldRefs.city}
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, city: e.target.value });
                        if (addressFormErrors.city) {
                          setAddressFormErrors({ ...addressFormErrors, city: '' });
                        }
                      }}
                      placeholder="Enter city"
                      disabled={isSubmitting}
                      aria-invalid={!!addressFormErrors.city}
                      className="text-sm sm:text-base"
                    />
                    {addressFormErrors.city && (
                      <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState" className="text-sm font-medium">State *</Label>
                    <Select
                      value={addressForm.state}
                      onValueChange={(value) => {
                        setAddressForm({ ...addressForm, state: value });
                        if (addressFormErrors.state) {
                          setAddressFormErrors({ ...addressFormErrors, state: '' });
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        ref={addressFieldRefs.state}
                        aria-invalid={!!addressFormErrors.state}
                        className="text-sm sm:text-base bg-input-bg hover:bg-sand border-input aria-[invalid=true]:border-destructive"
                      >
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addressFormErrors.state && (
                      <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressZipCode" className="text-sm font-medium">Pincode *</Label>
                  <div className="relative">
                    <Input
                      id="addressZipCode"
                      ref={addressFieldRefs.zipCode}
                      value={addressForm.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only allow numbers, max 6 digits
                        setAddressForm({ ...addressForm, zipCode: value });
                        if (addressFormErrors.zipCode) {
                          setAddressFormErrors({ ...addressFormErrors, zipCode: '' });
                        }
                      }}
                      placeholder="000000"
                      maxLength={6}
                      disabled={isSubmitting}
                      aria-invalid={!!addressFormErrors.zipCode}
                      className="text-sm sm:text-base"
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                      </div>
                    )}
                  </div>
                  {addressFormErrors.zipCode && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Additional Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressNearbyPlaces" className="text-sm font-medium">Nearby Places/Landmarks</Label>
                  <Input
                    id="addressNearbyPlaces"
                    value={addressForm.nearbyPlaces}
                    onChange={(e) => setAddressForm({ ...addressForm, nearbyPlaces: e.target.value })}
                    placeholder="Hospital, Mall, etc. (Optional)"
                    disabled={isSubmitting}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer text-sm font-medium">
                    Set as default address
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddressModal(false);
                  setEditingAddress(null);
                }}
                className="flex-1 w-full sm:w-auto text-xs sm:text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={isSubmitting} className="flex-1 w-full sm:w-auto text-xs sm:text-sm">
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : editingAddress ? (
                  'Update Address'
                ) : (
                  'Add Address'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}