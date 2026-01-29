'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle, ShoppingBag } from 'lucide-react';
import { paymentApi, orderApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderIdParam = searchParams.get('order_id');
        if (!orderIdParam) {
          setPaymentStatus('failed');
          setIsVerifying(false);
          toast({
            title: 'Invalid Payment Response',
            description: 'Order ID not found in payment response.',
            variant: 'destructive',
          });
          return;
        }

        // Find order by order number
        const ordersResponse = await orderApi.getOrders();
        if (ordersResponse.error || !ordersResponse.data?.data?.orders) {
          throw new Error('Failed to fetch orders');
        }

        const order = ordersResponse.data.data.orders.find(
          (o: any) => o.orderNumber === orderIdParam
        );

        if (!order) {
          // Order not found - might be webhook delay
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              verifyPayment();
            }, 2000);
            return;
          } else {
            // Max retries reached, try direct verification
            setPaymentStatus('pending');
            setIsVerifying(false);
            toast({
              title: 'Order Processing',
              description: 'Your payment is being processed. Please check your orders page in a few minutes.',
              variant: 'default',
            });
            return;
          }
        }

        setOrderId(order._id);
        setOrderNumber(order.orderNumber);

        // Verify payment status
        const verifyResponse = await paymentApi.verifyPayment(order._id);
        
        if (verifyResponse.error) {
          throw new Error(verifyResponse.error);
        }

        const status = verifyResponse.data?.data?.paymentStatus;
        if (status === 'completed') {
          setPaymentStatus('success');
          setIsVerifying(false);
          toast({
            title: 'Payment Successful! 🎉',
            description: 'Your order has been placed successfully.',
          });
        } else if (status === 'failed') {
          setPaymentStatus('failed');
          setIsVerifying(false);
        } else {
          // Payment still pending, check again with retry limit
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              verifyPayment();
            }, 2000);
          } else {
            setPaymentStatus('pending');
            setIsVerifying(false);
            toast({
              title: 'Payment Processing',
              description: 'Your payment is being processed. Please check your orders page shortly.',
              variant: 'default',
            });
          }
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        setIsVerifying(false);
        toast({
          title: 'Verification Error',
          description: error.message || 'Failed to verify payment status. Please check your orders page.',
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [searchParams, retryCount]);

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your order has been placed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderNumber && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-lg font-semibold">{orderNumber}</p>
              </div>
            )}
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/orders${orderId ? `?order=${orderId}` : ''}`}>
                  View Order
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            We couldn't verify your payment. Please contact support if you were charged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/checkout">
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/cart">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

