'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, MapPin, Mail, Truck, ShoppingBag, ListOrdered, CreditCard } from 'lucide-react';
import type { Order } from '@/types/order';

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  completed: 'border-sage/40 bg-sage/15 text-sage-deep',
  pending: 'border-gold/40 bg-gold-soft text-gold-ink',
  failed: 'border-destructive/40 bg-destructive/10 text-destructive',
  refunded: 'border-border bg-muted text-text-muted',
};

function formatPaymentMethod(order: Order): string {
  const method = (order.paymentMethod || '').toUpperCase();
  if (method === 'COD') return 'Cash on Delivery';
  if (method === 'ONLINE' || method === 'CASHFREE') {
    return order.paymentGateway && order.paymentGateway !== 'none'
      ? `Online Payment (${order.paymentGateway})`
      : 'Online Payment';
  }
  return order.paymentMethod;
}

export function OrderConfirmation({ order }: { order: Order }) {
  const paymentStatus = (order.paymentStatus || 'pending').toLowerCase();

  return (
    <div className="container mx-auto max-w-4xl px-3 py-8 sm:px-4 sm:py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/15">
          <CheckCircle className="h-9 w-9 text-sage-deep" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-2">Thank you</p>
        <h1 className="font-display text-3xl font-medium sm:text-4xl">Order Confirmed!</h1>
        <p className="mt-2 text-sm text-text-muted">
          Order <span className="font-medium text-heading">{order.orderNumber}</span> has been placed successfully.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="mb-1.5 text-xs uppercase tracking-luxe text-text-muted">Payment Status</p>
            <Badge className={PAYMENT_STATUS_STYLE[paymentStatus] || PAYMENT_STATUS_STYLE.pending}>
              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="mb-1.5 text-xs uppercase tracking-luxe text-text-muted">Payment Method</p>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <CreditCard className="h-3.5 w-3.5 text-text-muted" />
              {formatPaymentMethod(order)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="mb-1.5 text-xs uppercase tracking-luxe text-text-muted">Estimated Delivery</p>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Truck className="h-3.5 w-3.5 text-text-muted" />
              {order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'To be confirmed'}
            </div>
          </CardContent>
        </Card>
      </div>

      {order.emiEnabled && order.emiPlan && (
        <Card className="mt-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div>
              <p className="text-xs uppercase tracking-luxe text-text-muted">EMI Plan</p>
              <p className="text-sm font-medium">
                {order.emiPlan.tenureMonths} months
                {order.emiPlan.bankName ? ` · ${order.emiPlan.bankName}` : ''}
                {order.emiPlan.interestRate === 0 ? ' · No-cost EMI' : ` · ${order.emiPlan.interestRate}% p.a.`}
              </p>
            </div>
            <p className="text-sm font-semibold">
              ₹{order.emiPlan.monthlyInstallment.toLocaleString('en-IN')}/mo
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Ordered Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
          {order.items.map((item) => (
            <div key={item._id} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="relative h-14 w-14 flex-shrink-0">
                <Image
                  src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product?.name || 'Product'}
                  fill
                  className="rounded object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.product?.name}</p>
                <p className="text-xs text-text-muted">
                  Qty: {item.quantity} • Size: {item.size || item.product?.size}
                </p>
              </div>
              <p className="flex-shrink-0 self-start text-sm font-medium">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </p>
            </div>
          ))}

          <Separator />

          <div className="space-y-1.5 text-sm">
            {typeof order.subtotal === 'number' && (
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            {!!order.discount && (
              <div className="flex justify-between text-sage-deep">
                <span>Discount</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {typeof order.shipping === 'number' && (
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toLocaleString('en-IN')}`}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total Amount</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm sm:p-6 sm:pt-0">
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-text-muted">
            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>
          <p className="text-text-muted">Phone: {order.shippingAddress.phone}</p>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-text-muted sm:text-sm">
        <Mail className="h-4 w-4 flex-shrink-0" />
        A confirmation email has been sent to <span className="font-medium text-heading">{order.shippingAddress.email}</span>.
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/orders">View Orders</Link>
        </Button>
        <Button variant="outline" disabled className="gap-1.5">
          <ListOrdered className="h-4 w-4" />
          Track Order — Coming Soon
        </Button>
      </div>
    </div>
  );
}
