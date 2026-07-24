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
  Loader2,
  XCircle,
  ShoppingBag,
  RefreshCcw
} from 'lucide-react';
import { orderApi, paymentApi } from '@/lib/api';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import type { Order } from '@/types/order';

type PaymentStatus = 'completed' | 'failed' | 'pending';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const onlineOrderNumber = searchParams.get('order_id');
  const codOrderId = searchParams.get('order');
  const isCod = searchParams.get('method') === 'cod';

  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [order, setOrder] = useState<Order | null>(null);

  // COD flow: the order is already confirmed, just fetch and display it once.
  useEffect(() => {
    if (!isCod) return;

    if (!codOrderId) {
      setPaymentStatus('failed');
      setIsVerifying(false);
      return;
    }

    (async () => {
      try {
        const res = await orderApi.getOrder(codOrderId);
        if (res.error || !res.data?.data?.order) {
          throw new Error(res.error || 'Order not found');
        }
        setOrder(res.data.data.order);
        setPaymentStatus('completed');
      } catch (err) {
        console.error('Error fetching COD order:', err);
        setPaymentStatus('failed');
      } finally {
        setIsVerifying(false);
      }
    })();
  }, [isCod, codOrderId]);

  // Online (Cashfree) flow: poll payment verification, then fetch the full
  // order (the verify response doesn't populate items.product).
  useEffect(() => {
    if (isCod) return;

    if (!onlineOrderNumber) {
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

        const res = await paymentApi.verifyPaymentByOrderNumber(onlineOrderNumber);

        if (res.error) {
          console.error('Payment verification API error:', res.error);
          if (attempts >= MAX_ATTEMPTS) {
            setPaymentStatus('pending');
            setIsVerifying(false);
            clearInterval(interval);
          }
          return;
        }

        const rawStatus = res.data?.data?.paymentStatus;
        const verifiedOrder = res.data?.data?.order;

        if (rawStatus === 'completed' || rawStatus === 'failed' || rawStatus === 'pending') {
          if (rawStatus === 'completed') {
            setPaymentStatus('completed');
            setIsVerifying(false);
            clearInterval(interval);

            // Fetch the fully-populated order for display.
            if (verifiedOrder?._id) {
              orderApi.getOrder(verifiedOrder._id).then((full) => {
                if (full.data?.data?.order) setOrder(full.data.data.order);
              }).catch((err) => console.error('Error fetching full order detail:', err));
            }
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
  }, [isCod, onlineOrderNumber]);

  // --------------------
  // VERIFYING STATE
  // --------------------
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-gold" />
            <h2 className="text-xl font-semibold mb-2">
              {isCod ? 'Loading Your Order' : 'Verifying Payment'}
            </h2>
            <p className="text-text-muted">
              {isCod ? 'Just a moment…' : 'Please wait while we confirm your payment.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------
  // SUCCESS — rich order confirmation once the full order has loaded,
  // otherwise a minimal fallback while that follow-up fetch resolves.
  // --------------------
  if (paymentStatus === 'completed') {
    if (order) {
      return <OrderConfirmation order={order} />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-gold" />
            <p className="text-text-muted">Loading your order details…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --------------------
  // PENDING (online flow only)
  // --------------------
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-gold" />
            <CardTitle>Payment Processing</CardTitle>
            <CardDescription>
              We are still confirming your payment.
              <br />
              Please don&apos;t refresh or close this page.
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
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {isCod ? 'Order Not Found' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {isCod ? (
              'We couldn’t load your order details. Check your orders page or contact support.'
            ) : (
              <>
                We couldn&apos;t verify your payment.
                <br />
                If money was deducted, please contact support.
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href={isCod ? '/orders' : '/checkout'}>
              {isCod ? 'View Orders' : 'Try Again'}
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
