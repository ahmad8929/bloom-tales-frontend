'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, CheckCircle, CreditCard, Smartphone, ShoppingBag, Upload, X, Camera, AlertTriangle, Plus, Edit, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi, orderApi, profileApi } from '@/lib/api';
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

interface PaymentModalData {
  payerName: string;
  transactionId: string;
  paymentDate: string;
  paymentTime: string;
  amount: number;
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
  addressType: 'home' | 'work' | 'other';
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
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
    isDefault: false,
    addressType: 'home' as 'home' | 'work' | 'other'
  });

  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});

  const [paymentData, setPaymentData] = useState<PaymentModalData>({
    payerName: '',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    amount: 0
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [orderCreated, setOrderCreated] = useState(false);

  const UPI_ID = "bloompayments@paytm"; // Replace with your actual UPI ID
  const QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=" + UPI_ID + "&pn=Bloom%20Tales&am=";

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
      setPaymentData(prev => ({ ...prev, amount: calculateTotal(cartData) }));
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
      return { subtotal: 0, shipping: 0, platformFee: 0, otherFees: 0, handlingFee: 0, total: 0 };
    }

    const subtotal = cartData.totalAmount || cartData.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const shipping = 149; // Always charge ₹149 for shipping
    const platformFee = 49; // Original fee, but shown as Free
    const otherFees = 0; // Free
    const handlingFee = 49; // Original fee, but shown as Free
    const total = subtotal + shipping; // Shipping is always charged

    return { subtotal, shipping, platformFee, otherFees, handlingFee, total };
  };

  const calculateTotal = (cartData: CartData) => {
    return calculateTotals(cartData).total;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast({
      title: 'Copied!',
      description: 'UPI ID copied to clipboard',
    });
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
      isDefault: addresses.length === 0,
      addressType: 'home'
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
      isDefault: address.isDefault,
      addressType: address.addressType
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Full Name validation
    if (!addressForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (addressForm.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = addressForm.phone.replace(/\D/g, '').slice(-10);
    if (!addressForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    // Street validation
    if (!addressForm.street.trim()) {
      errors.street = 'Street address is required';
    } else if (addressForm.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters';
    }

    // City validation
    if (!addressForm.city.trim()) {
      errors.city = 'City is required';
    } else if (addressForm.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }

    // State validation
    if (!addressForm.state.trim()) {
      errors.state = 'State is required';
    }

    // ZIP Code validation (Indian pincode)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!addressForm.zipCode.trim()) {
      errors.zipCode = 'Pincode is required';
    } else if (!pincodeRegex.test(addressForm.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid 6-digit pincode';
    }

    setAddressFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    // Validate form before submission
    if (!validateAddressForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
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

  const handlePaymentInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (PNG, JPG, JPEG)',
          variant: 'destructive',
        });
        return;
      }

      setPaymentProof(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentProofPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePaymentProof = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
    // Reset file input
    const fileInput = document.getElementById('paymentProof') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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

  const validatePaymentForm = () => {
    const required = ['payerName', 'paymentDate', 'paymentTime'];
    for (const field of required) {
      if (!paymentData[field as keyof PaymentModalData]) {
        toast({
          title: 'Validation Error',
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: 'destructive',
        });
        return false;
      }
    }

    if (!paymentProof) {
      toast({
        title: 'Payment Proof Required',
        description: 'Please upload a screenshot of your payment',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    if (!cart) return;

    if (paymentMethod === 'upi') {
      setShowPaymentModal(true);
      return;
    }

    // Handle other payment methods (COD, Card)
    await processOrder();
  };

  const processOrder = async () => {
    setIsSubmitting(true);
    setUploadProgress(0);
    
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
        ...(paymentMethod === 'upi' && { paymentDetails: paymentData })
      };

      setUploadProgress(25);
      const response = await orderApi.createOrder(orderData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const orderId = response.data?.data?.order?._id;
      setUploadProgress(50);
      setOrderCreated(true);

      // If UPI payment with proof, upload the payment proof
      if (paymentMethod === 'upi' && paymentProof && orderId) {
        try {
          const formData = new FormData();
          formData.append('paymentProof', paymentProof);
          
          setUploadProgress(75);
          const proofResponse = await orderApi.uploadPaymentProof(orderId, formData);
          
          if (proofResponse.error) {
            console.error('Payment proof upload failed:', proofResponse.error);
            toast({
              title: 'Order Placed Successfully! 🎉',
              description: 'Order created and sent for admin approval. Payment proof upload failed - you can upload it later.',
              variant: 'default',
            });
          } else {
            toast({
              title: 'Order Placed Successfully! 🎉',
              description: 'Order created with payment proof and sent for admin approval.',
            });
          }
        } catch (proofError) {
          console.error('Payment proof upload error:', proofError);
          toast({
            title: 'Order Placed Successfully! 🎉',
            description: 'Order created and sent for admin approval. You can upload payment proof from your orders page.',
            variant: 'default',
          });
        }
      } else {
        toast({
          title: 'Order Placed Successfully! 🎉',
          description: 'Order created and sent for admin approval. You will be notified once approved.',
        });
      }

      setUploadProgress(100);

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
      setShowPaymentModal(false);
      setUploadProgress(0);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!validatePaymentForm()) return;
    await processOrder();
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

  const { subtotal, shipping, platformFee, otherFees, handlingFee, total } = calculateTotals(cart);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-screen">
      <div className="text-center mb-6 sm:mb-12">
        <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Checkout</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Complete your order details below</p>
      </div>

      {/* Order Flow Notice */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Order Review Process</h3>
                <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                  After placing your order, it will be sent to our admin team for review and approval. 
                  You'll be notified via email once your order is approved and ready for processing. 
                  This helps us ensure quality and prevent any issues with your order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="font-headline flex items-center gap-2 text-base sm:text-lg">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select or add a delivery address</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAddress}
                  disabled={orderCreated}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No addresses saved</p>
                  <Button variant="outline" onClick={handleAddAddress} disabled={orderCreated}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address._id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      } ${orderCreated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !orderCreated && setSelectedAddressId(address._id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <input
                              type="radio"
                              checked={selectedAddressId === address._id}
                              onChange={() => !orderCreated && setSelectedAddressId(address._id)}
                              disabled={orderCreated}
                              className="w-4 h-4 flex-shrink-0"
                            />
                            <span className="font-medium text-sm sm:text-base">{address.fullName}</span>
                            {address.isDefault && (
                              <Badge variant="default" className="text-xs">Default</Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                              {address.addressType}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground ml-6 break-words">
                            {address.street}, {address.city}, {address.state} - {address.zipCode}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground ml-6">{address.country}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground ml-6 mt-1">
                            Phone: {address.phone}
                          </p>
                          {address.nearbyPlaces && (
                            <p className="text-xs sm:text-sm text-muted-foreground ml-6 mt-1">
                              Landmark: {address.nearbyPlaces}
                            </p>
                          )}
                        </div>
                        {!orderCreated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Order Summary */}
        <div>
          <Card className="lg:sticky lg:top-4 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Order Items */}
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item._id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg bg-muted/20">
                    <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="(max-width: 640px) 40px, 48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • Size: {item.size || item.product.size}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium flex-shrink-0">
                      ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span>₹{shipping.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Handling Fee</span>
                  <span className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">₹{handlingFee.toLocaleString('en-IN')}</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Platform Fee</span>
                  <span className="flex items-center gap-2">
                    <span className="line-through text-muted-foreground">₹{platformFee.toLocaleString('en-IN')}</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Other Expense</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {orderCreated ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="font-semibold text-green-800">Order Placed Successfully!</p>
                    <p className="text-sm text-green-700">Redirecting to your orders...</p>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base">
                      Place Order - ₹{total.toLocaleString('en-IN')}
                    </span>
                  )}
                </Button>
              )}

              {!orderCreated && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 text-center">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Order will be sent for admin approval after placement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Dialog 
        open={showPaymentModal} 
        onOpenChange={(open) => {
          // Prevent closing by clicking outside or pressing ESC - only allow via close button
          // Don't update state if trying to close (unless from our button)
          if (!open) {
            // Prevent closing - keep modal open
            return;
          }
        }}
      >
        <DialogContent 
          className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto [&>button]:hidden"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Payment Confirmation
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-muted absolute right-3 sm:right-4 top-3 sm:top-4"
                onClick={() => {
                  if (!isSubmitting) {
                    setShowPaymentModal(false);
                  }
                }}
                disabled={isSubmitting}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              Complete your payment using the QR code or UPI ID below, then provide your payment details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* QR Code and UPI Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/20">
              <div className="text-center space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  Scan QR Code or Use UPI ID
                </h3>
                
                <div className="bg-white p-2 sm:p-4 rounded-lg inline-block shadow-lg">
                  <img 
                    src={`${QR_CODE_URL}${total}`} 
                    alt="UPI QR Code" 
                    className="w-40 h-40 sm:w-56 sm:h-56 mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Or send payment to UPI ID:</p>
                  <div className="flex items-center justify-center gap-2 px-2">
                    <code className="bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-base font-semibold flex items-center gap-1 sm:gap-2 border-2 border-primary/30 break-all">
                      <span className="break-all">{UPI_ID}</span>
                      <Button size="sm" variant="ghost" onClick={copyUpiId} className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-primary/10 flex-shrink-0">
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </code>
                  </div>
                </div>
                
                <div className="text-lg sm:text-xl font-bold text-primary bg-white/70 rounded-lg p-2 sm:p-3 border-2 border-primary/30">
                  Amount: ₹{total.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Details Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payerName">Payer Name *</Label>
                <Input 
                  id="payerName" 
                  placeholder="Name on UPI account"
                  value={paymentData.payerName}
                  onChange={(e) => handlePaymentInputChange('payerName', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID/UTR Number</Label>
                <Input 
                  id="transactionId" 
                  placeholder="12-digit transaction ID"
                  value={paymentData.transactionId}
                  onChange={(e) => handlePaymentInputChange('transactionId', e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your payment app after successful payment (Optional)
                </p>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-sm">Payment Date *</Label>
                <Input 
                  id="paymentDate" 
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => handlePaymentInputChange('paymentDate', e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTime" className="text-sm">Payment Time *</Label>
                <Input 
                  id="paymentTime" 
                  type="time"
                  value={paymentData.paymentTime}
                  onChange={(e) => handlePaymentInputChange('paymentTime', e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            </div>

            {/* Payment Proof Upload */}
            <div className="space-y-2">
              <Label htmlFor="paymentProof">Payment Screenshot/Proof *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                {paymentProofPreview ? (
                  <div className="space-y-3">
                    <div className="relative max-w-xs mx-auto">
                      <img 
                        src={paymentProofPreview} 
                        alt="Payment proof preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={removePaymentProof}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-green-600 font-medium">Payment proof uploaded ✓</p>
                    {!isSubmitting && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('paymentProof')?.click()}
                      >
                        Change Image
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload Payment Screenshot</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('paymentProof')?.click()}
                      disabled={isSubmitting}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                )}
                <input
                  id="paymentProof"
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentProofChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Please upload a clear screenshot of your payment confirmation from your UPI app
              </p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground">Amount Paid</div>
              <div className="text-lg font-semibold text-primary">₹{total.toLocaleString('en-IN')}</div>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing order...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!isSubmitting) {
                    setShowPaymentModal(false);
                  }
                }} 
                className="flex-1 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button 
                onClick={handlePaymentSubmit} 
                disabled={isSubmitting} 
                className="flex-1 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </div>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your address details below'
                : 'Add a new delivery address to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressFullName">Full Name *</Label>
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
                className={addressFormErrors.fullName ? 'border-destructive' : ''}
              />
              {addressFormErrors.fullName && (
                <p className="text-sm text-destructive">{addressFormErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressPhone">Phone Number *</Label>
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
                className={addressFormErrors.phone ? 'border-destructive' : ''}
              />
              {addressFormErrors.phone && (
                <p className="text-sm text-destructive">{addressFormErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressStreet">Street Address *</Label>
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
                className={addressFormErrors.street ? 'border-destructive' : ''}
              />
              {addressFormErrors.street && (
                <p className="text-sm text-destructive">{addressFormErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressCity" className="text-sm">City *</Label>
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
                <Label htmlFor="addressState" className="text-sm">State *</Label>
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
                  <SelectTrigger className={`text-sm sm:text-base ${addressFormErrors.state ? 'border-destructive' : ''}`}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressZipCode" className="text-sm">Pincode *</Label>
                <Input
                  id="addressZipCode"
                  value={addressForm.zipCode}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, zipCode: e.target.value });
                    if (addressFormErrors.zipCode) {
                      setAddressFormErrors({ ...addressFormErrors, zipCode: '' });
                    }
                  }}
                  placeholder="000000"
                  disabled={isSubmitting}
                  className={`text-sm sm:text-base ${addressFormErrors.zipCode ? 'border-destructive' : ''}`}
                />
                {addressFormErrors.zipCode && (
                  <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.zipCode}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressType" className="text-sm">Address Type</Label>
                <Select
                  value={addressForm.addressType}
                  onValueChange={(value: any) => setAddressForm({ ...addressForm, addressType: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNearbyPlaces">Nearby Places/Landmarks</Label>
              <Input
                id="addressNearbyPlaces"
                value={addressForm.nearbyPlaces}
                onChange={(e) => setAddressForm({ ...addressForm, nearbyPlaces: e.target.value })}
                placeholder="Hospital, Mall, etc. (Optional)"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="rounded border-gray-300"
                disabled={isSubmitting}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddressModal(false);
                  setEditingAddress(null);
                }}
                className="flex-1 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={isSubmitting} className="flex-1 w-full sm:w-auto">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
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