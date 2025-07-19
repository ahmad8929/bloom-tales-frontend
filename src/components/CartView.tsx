
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function CartView() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="text-center">
        <p className="text-xl text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-12">
      <div className="md:col-span-2 space-y-4">
        {cartItems.map(item => (
          <Card key={item.id} className="flex items-center p-4">
            <Image 
              src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://placehold.co/128x128.png'} 
              alt={item.name} 
              width={128}
              height={128}
              className="object-cover rounded-md w-24 h-24 md:w-32 md:h-32" 
            />
            <div className="flex-grow ml-4">
              <h3 className="font-headline text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">Category: {item.category}</p>
              <p className="text-md font-semibold flex items-center mt-1">
                <IndianRupee className="h-4 w-4 mr-1" /> {item.price.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input type="number" value={item.quantity} readOnly className="h-8 w-12 text-center" />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold flex items-center"><IndianRupee className="h-4 w-4 mr-1" /> {cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold">FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="flex items-center"><IndianRupee className="h-5 w-5 mr-1" /> {cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
