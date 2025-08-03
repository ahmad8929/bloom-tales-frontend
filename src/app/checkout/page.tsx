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
import { QrCode, Copy, CheckCircle, CreditCard, Smartphone, ShoppingBag, Upload, X, Camera, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi, orderApi } from '@/lib/api';
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
  
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    nearbyPlaces: ''
  });

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
  }, []);

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
      return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }

    const subtotal = cartData.totalAmount || cartData.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
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

  const handleInputChange = (field: string, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
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
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingData[field as keyof typeof shippingData]) {
        toast({
          title: 'Validation Error',
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: 'destructive',
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingData.phone.replace(/\D/g, '').slice(-10))) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit Indian phone number',
        variant: 'destructive',
      });
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(shippingData.pincode)) {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid 6-digit pincode',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validatePaymentForm = () => {
    const required = ['payerName', 'transactionId', 'paymentDate', 'paymentTime'];
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

    // Transaction ID validation (basic)
    if (paymentData.transactionId.length < 6) {
      toast({
        title: 'Invalid Transaction ID',
        description: 'Transaction ID must be at least 6 characters long',
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
      const orderData = {
        shippingAddress: shippingData,
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

  const { subtotal, shipping, tax, total } = calculateTotals(cart);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground">Complete your order details below</p>
      </div>

      {/* Order Flow Notice */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Order Review Process</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  After placing your order, it will be sent to our admin team for review and approval. 
                  You'll be notified via email once your order is approved and ready for processing. 
                  This helps us ensure quality and prevent any issues with your order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>Please provide your delivery details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Enter your full name"
                    value={shippingData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={orderCreated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    value={shippingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={orderCreated}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+91 XXXXX XXXXX"
                  value={shippingData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={orderCreated}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input 
                  id="address" 
                  placeholder="House no, Street, Area"
                  value={shippingData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={orderCreated}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    placeholder="Enter city"
                    value={shippingData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={orderCreated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={shippingData.state} 
                    onValueChange={(value) => handleInputChange('state', value)}
                    disabled={orderCreated}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input 
                    id="pincode" 
                    placeholder="000000"
                    value={shippingData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    disabled={orderCreated}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nearbyPlaces">Nearby Places/Landmarks</Label>
                  <Input 
                    id="nearbyPlaces" 
                    placeholder="Hospital, Mall, etc. (Optional)"
                    value={shippingData.nearbyPlaces}
                    onChange={(e) => handleInputChange('nearbyPlaces', e.target.value)}
                    disabled={orderCreated}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose your preferred payment option</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod} 
                className="space-y-4"
                disabled={orderCreated}
              >
                <div className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : ''} ${orderCreated ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value="upi" id="upi" disabled={orderCreated} />
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="upi" className="font-medium cursor-pointer">UPI Payment</Label>
                    <div className="text-sm text-muted-foreground">Pay using Google Pay, PhonePe, Paytm, etc.</div>
                  </div>
                  <Badge variant="secondary">Recommended</Badge>
                </div>

                <div className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''} ${orderCreated ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value="card" id="card" disabled={orderCreated} />
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="card" className="font-medium cursor-pointer">Credit/Debit Card</Label>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, RuPay accepted</div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>

                <div className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : ''} ${orderCreated ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RadioGroupItem value="cod" id="cod" disabled={orderCreated} />
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="font-medium cursor-pointer">Cash on Delivery</Label>
                    <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                  </div>
                </div>
              </RadioGroup>

              {/* UPI Payment Section */}
              {paymentMethod === 'upi' && !orderCreated && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Complete Your Payment
                    </h3>
                    
                    <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                      <img 
                        src={`${QR_CODE_URL}${total}`} 
                        alt="UPI QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Scan QR code or use UPI ID below:</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="bg-muted px-3 py-2 rounded font-mono text-sm flex items-center gap-2">
                          {UPI_ID}
                          <Button size="sm" variant="ghost" onClick={copyUpiId} className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </code>
                      </div>
                    </div>
                    
                    <div className="text-lg font-semibold text-primary bg-white/50 rounded-lg p-3">
                      Amount: ₹{total.toLocaleString('en-IN')}
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-white/30 rounded p-2">
                      After payment, you'll need to provide transaction details and upload payment proof
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item._id} className="flex gap-3 p-3 border rounded-lg bg-muted/20">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • Size: {item.size || item.product.size}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 You saved ₹99 on shipping!</p>
                )}
                <div className="flex justify-between">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {subtotal < 1000 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}
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
                  disabled={isSubmitting || paymentMethod === 'card'}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Place Order - ₹${total.toLocaleString('en-IN')}`
                  )}
                </Button>
              )}

              {paymentMethod === 'card' && !orderCreated && (
                <p className="text-xs text-center text-muted-foreground">
                  Card payments coming soon! Please use UPI or COD for now.
                </p>
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
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Payment Confirmation
            </DialogTitle>
            <DialogDescription>
              Please provide your payment details and upload payment proof to confirm the transaction.
            </DialogDescription>
          </DialogHeader>
          
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
              <Label htmlFor="transactionId">Transaction ID/UTR Number *</Label>
              <Input 
                id="transactionId" 
                placeholder="12-digit transaction ID"
                value={paymentData.transactionId}
                onChange={(e) => handlePaymentInputChange('transactionId', e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                You can find this in your payment app after successful payment
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input 
                  id="paymentDate" 
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => handlePaymentInputChange('paymentDate', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTime">Payment Time *</Label>
                <Input 
                  id="paymentTime" 
                  type="time"
                  value={paymentData.paymentTime}
                  onChange={(e) => handlePaymentInputChange('paymentTime', e.target.value)}
                  disabled={isSubmitting}
                />
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

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentSubmit} 
                disabled={isSubmitting} 
                className="flex-1"
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
    </div>
  );
}