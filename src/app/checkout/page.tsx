'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, CheckCircle, CreditCard, Smartphone, ShoppingBag, Upload, X, Camera, AlertTriangle, Plus, Edit, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi, orderApi, profileApi, couponApi, paymentApi } from '@/lib/api';
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cashfree');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [userEmail, setUserEmail] = useState('');
  
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
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

  const calculateTotals = (cartData: CartData) => {
    if (!cartData || !cartData.items.length) {
      return { 
        subtotal: 0, 
        automaticDiscount: 0, 
        couponDiscount: 0, 
        totalDiscount: 0,
        subtotalAfterDiscount: 0,
        shipping: 0, 
        advancePayment: 0,
        total: 0 
      };
    }

    const subtotal = cartData.totalAmount || cartData.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    
    // Apply automatic discount based on subtotal
    // If subtotal > ₹20,000: 10% discount
    // If subtotal > ₹10,000: 4% discount
    // Only highest eligible discount applies
    let automaticDiscount = 0;
    if (subtotal > 20000) {
      automaticDiscount = Math.round(subtotal * 0.10);
    } else if (subtotal > 10000) {
      automaticDiscount = Math.round(subtotal * 0.04);
    }

    // Coupon discount (applied after automatic discount)
    const couponDiscount = appliedCoupon?.discountAmount || 0;
    const totalDiscount = automaticDiscount + couponDiscount;
    const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount);

    // Calculate shipping (COD shipping charge; online payment has free shipping)
    let shipping = 0;
    let advancePayment = 0;

    if (paymentMethod === 'cod') {
      // COD: ₹199 shipping (no advance payment)
      shipping = 199;
      advancePayment = 0;
    } else {
      // Online payment (Cashfree): Free shipping
      shipping = 0;
      advancePayment = 0;
    }

    // Final total (advance payment is NOT included - it's paid separately)
    const total = subtotalAfterDiscount + shipping;

    return { 
      subtotal, 
      automaticDiscount,
      couponDiscount,
      totalDiscount,
      subtotalAfterDiscount,
      shipping, 
      advancePayment,
      total 
    };
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!cart) {
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const response = await couponApi.validateCoupon(couponCode, cart.totalAmount);
      
      if (response.error) {
        setCouponError(response.error);
        setAppliedCoupon(null);
        return;
      }

      if (response.data?.data?.discount) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discountAmount: response.data.data.discount.discountAmount
        });
        toast({
          title: 'Coupon Applied!',
          description: `You saved ₹${response.data.data.discount.discountAmount.toLocaleString('en-IN')}`,
        });
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      setCouponError(error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
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
        ...(appliedCoupon && { couponCode: appliedCoupon.code })
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
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox'
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

  const calculateTotal = (cartData: CartData) => {
    return calculateTotals(cartData).total;
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

  const validateAddressForm = (): boolean => {
    // Validation removed - always return true
    setAddressFormErrors({});
    return true;
  };

  const handleSaveAddress = async () => {
    // Validation removed - proceed directly

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
        ...(appliedCoupon && { couponCode: appliedCoupon.code })
      };

      const response = await orderApi.createOrder(orderData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      setOrderCreated(true);

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: 'Order created and sent for admin approval. You will be notified once approved.',
      });

      // Clear cart after successful order
      await cartApi.clearCart();
      
      // Redirect to orders page after a short delay
      setTimeout(() => {
        router.push('/orders');
      }, 2000);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items to proceed with checkout.</p>
        <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  const { subtotal, automaticDiscount, couponDiscount, totalDiscount, subtotalAfterDiscount, shipping, advancePayment, total } = calculateTotals(cart);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-12 min-h-screen">
      <div className="text-center mb-4 sm:mb-6 md:mb-12">
        <h1 className="font-headline text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-4">Checkout</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Complete your order details below</p>
      </div>

      {/* No Returns Policy Notice */}
   {/*    <div className="max-w-4xl mx-auto mb-3 sm:mb-4 md:mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600 mt-0.5 sm:mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">No Returns Policy</h3>
                <p className="text-red-800 text-xs sm:text-sm leading-relaxed break-words">
                  <strong>Important:</strong> All products are non-returnable. Please review your order carefully before placing it. 
                  By proceeding with checkout, you acknowledge that you have read and agree to this policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>  */}

      {/* Order Review Process Notice */}
    {/*  <div className="max-w-4xl mx-auto mb-3 sm:mb-4 md:mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Order Review Process</h3>
                <p className="text-blue-800 text-xs sm:text-sm leading-relaxed break-words">
                  After placing your order, it will be sent to our admin team for review and approval. 
                  You'll be notified via email once your order is approved and ready for processing. 
                  This helps us ensure quality and prevent any issues with your order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>  */}

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card>
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
                      onClick={() => !orderCreated && setSelectedAddressId(address._id)}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <input
                              type="radio"
                              checked={selectedAddressId === address._id}
                              onChange={() => !orderCreated && setSelectedAddressId(address._id)}
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

          {/* Payment Method Selection */}
          <Card className="mt-3 sm:mt-4 md:mt-6">
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
                onValueChange={(value) => setPaymentMethod(value)}
                disabled={orderCreated}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="cod" id="cod" className="mt-1" disabled={orderCreated} />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="cursor-pointer font-medium text-sm sm:text-base">
                      Cash on Delivery (COD)
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Pay on delivery. (₹199 shipping charge applies)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors border-primary/50">
                  <RadioGroupItem value="cashfree" id="cashfree" className="mt-1" disabled={orderCreated} />
                  <div className="flex-1">
                    <Label htmlFor="cashfree" className="cursor-pointer font-medium text-sm sm:text-base">
                      Secure Online Payment (Cashfree)
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Free shipping. Secure payment gateway with instant confirmation. Supports UPI, Cards, Net Banking, Wallets.
                    </p>
                  </div>
                </div>
              </RadioGroup>
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
                {!appliedCoupon ? (
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
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-green-800">
                        {appliedCoupon.code}
                      </span>
                      <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-100 text-green-800 border-green-300">
                        -₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      disabled={orderCreated}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-600">{couponError}</p>
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
                    <span className="text-green-600 font-medium">
                      Discount {subtotal > 20000 ? '(10%)' : '(4%)'}
                    </span>
                    <span className="flex-shrink-0 ml-2 text-green-600 font-medium">
                      -₹{automaticDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                
                {/* Coupon Discount */}
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                    <span className="text-green-600 font-medium">
                      Coupon Discount ({appliedCoupon?.code})
                    </span>
                    <span className="flex-shrink-0 ml-2 text-green-600 font-medium">
                      -₹{couponDiscount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                
                {/* Shipping */}
                <div className="flex justify-between items-start gap-2 text-xs sm:text-sm md:text-base">
                  <span>Shipping</span>
                  <span className="flex-shrink-0 ml-2">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₹${shipping.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                
                <Separator />
                <div className="flex justify-between items-center gap-2 text-sm sm:text-base md:text-lg font-semibold pt-1">
                  <span>Total Amount</span>
                  <span className="flex-shrink-0 ml-2">₹{total.toLocaleString('en-IN')}</span>
                </div>
                
                {/* COD breakdown removed (no advance payment) */}
              </div>

              {orderCreated ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-green-600 mb-1.5 sm:mb-2" />
                    <p className="font-semibold text-green-800 text-xs sm:text-sm md:text-base">Order Placed Successfully!</p>
                    <p className="text-xs sm:text-sm text-green-700 mt-1">Redirecting to your orders...</p>
                  </div>
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
                      {`Place Order - ₹${total.toLocaleString('en-IN')}`}
                    </span>
                  )}
                </Button>
              )}

              {!orderCreated && (
                <>
                  <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-blue-800 text-center leading-relaxed">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 align-middle" />
                      Order will be sent for admin approval after placement
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-red-800 text-center leading-relaxed">
                      <strong>No Returns:</strong> All products are non-returnable
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
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
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Personal Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressFullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="addressFullName"
                    value={addressForm.fullName}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, fullName: e.target.value });
                      if (addressFormErrors.fullName) {
                        setAddressFormErrors({ ...addressFormErrors, fullName: '' });
                      }
                    }}
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                    className={`text-sm sm:text-base ${addressFormErrors.fullName ? 'border-destructive' : ''}`}
                  />
                  {addressFormErrors.fullName && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressPhone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="addressPhone"
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, phone: e.target.value });
                      if (addressFormErrors.phone) {
                        setAddressFormErrors({ ...addressFormErrors, phone: '' });
                      }
                    }}
                    placeholder="+91 XXXXX XXXXX"
                    disabled={isSubmitting}
                    className={`text-sm sm:text-base ${addressFormErrors.phone ? 'border-destructive' : ''}`}
                  />
                  {addressFormErrors.phone && (
                    <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Address Details</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet" className="text-sm font-medium">Street Address *</Label>
                  <Input
                    id="addressStreet"
                    value={addressForm.street}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, street: e.target.value });
                      if (addressFormErrors.street) {
                        setAddressFormErrors({ ...addressFormErrors, street: '' });
                      }
                    }}
                    placeholder="House no, Street, Area"
                    disabled={isSubmitting}
                    className={`text-sm sm:text-base ${addressFormErrors.street ? 'border-destructive' : ''}`}
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
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, city: e.target.value });
                        if (addressFormErrors.city) {
                          setAddressFormErrors({ ...addressFormErrors, city: '' });
                        }
                      }}
                      placeholder="Enter city"
                      disabled={isSubmitting}
                      className={`text-sm sm:text-base ${addressFormErrors.city ? 'border-destructive' : ''}`}
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
                      <SelectTrigger className={`text-sm sm:text-base bg-[#F5F5F5] hover:bg-[#EEEEEE] ${addressFormErrors.state ? 'border-destructive' : 'border-gray-300'}`}>
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
                      className={`text-sm sm:text-base ${addressFormErrors.zipCode ? 'border-destructive' : ''}`}
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
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
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Additional Information</h3>
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
                    className="rounded border-gray-300 w-4 h-4 cursor-pointer"
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