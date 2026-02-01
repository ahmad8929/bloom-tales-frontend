'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Loader2,
  XCircle,
  ShoppingBag,
  RefreshCcw
} from 'lucide-react';
import { paymentApi } from '@/lib/api';

type PaymentStatus = 'completed' | 'failed' | 'pending';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_id');

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>('pending');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] =
    useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setPaymentStatus('failed');
      setIsVerifying(false);
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 15; // ~30 seconds
    const INTERVAL_MS = 2000;

    const interval = setInterval(async () => {
      try {
        attempts++;

        const res =
          await paymentApi.verifyPaymentByOrderNumber(orderNumber);

        const rawStatus = res.data?.data?.paymentStatus;
        const order = res.data?.data?.order;

        // ✅ TYPE GUARD (this fixes the TS error)
        if (
          rawStatus === 'completed' ||
          rawStatus === 'failed' ||
          rawStatus === 'pending'
        ) {
          if (rawStatus === 'completed') {
            setOrderId(order?._id || null);
            setConfirmedOrderNumber(order?.orderNumber || null);
            setPaymentStatus('completed');
            setIsVerifying(false);
            clearInterval(interval);
            return;
          }

          if (rawStatus === 'failed') {
            setPaymentStatus('failed');
            setIsVerifying(false);
            clearInterval(interval);
            return;
          }
        }

        // still pending
        if (attempts >= MAX_ATTEMPTS) {
          setPaymentStatus('pending');
          setIsVerifying(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setPaymentStatus('pending');
        setIsVerifying(false);
        clearInterval(interval);
      }
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderNumber]);

  // --------------------
  // VERIFYING STATE
  // --------------------
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">
              Verifying Payment
            </h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------
  // SUCCESS
  // --------------------
  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              Payment Successful 🎉
            </CardTitle>
            <CardDescription>
              Your order has been placed successfully.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {confirmedOrderNumber && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Order Number
                </p>
                <p className="text-lg font-semibold">
                  {confirmedOrderNumber}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link
                  href={`/orders${
                    orderId ? `?order=${orderId}` : ''
                  }`}
                >
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

  // --------------------
  // PENDING
  // --------------------
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-primary" />
            <CardTitle>Payment Processing</CardTitle>
            <CardDescription>
              We are still confirming your payment.
              <br />
              Please don’t refresh or close this page.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Retry Verification
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------
  // FAILED
  // --------------------
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">
            Payment Failed
          </CardTitle>
          <CardDescription>
            We couldn’t verify your payment.
            <br />
            If money was deducted, please contact support.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
