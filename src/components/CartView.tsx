'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { cartApi } from '@/lib/api';

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
  createdAt: string;
  updatedAt: string;
}

export function CartView() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch cart data
  useEffect(() => {
    fetchCart();
  }, []);

 const fetchCart = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await cartApi.getCart();
    
    if (response.error) {
      throw new Error(response.error);
    }

    // Handle the API response structure: { status: string; data: { cart: {...} } }
    const cartData = response.data?.data?.cart || null;
    setCart(cartData);
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    setError(error.message || 'Failed to load cart');
    toast({
      title: 'Error',
      description: 'Failed to load cart items',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await cartApi.updateCartItem(itemId, newQuantity);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state
      setCart(prevCart => {
        if (!prevCart) return null;
        
        return {
          ...prevCart,
          items: prevCart.items.map(item => 
            item._id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          ),
          totalItems: prevCart.items.reduce((sum, item) => 
            sum + (item._id === itemId ? newQuantity : item.quantity), 0
          ),
          totalAmount: prevCart.items.reduce((sum, item) => 
            sum + (item._id === itemId ? newQuantity : item.quantity) * item.product.price, 0
          )
        };
      });

      toast({
        title: 'Updated',
        description: 'Cart item quantity updated',
      });
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      const response = await cartApi.removeFromCart(itemId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Update local state
      setCart(prevCart => {
        if (!prevCart) return null;
        
        const updatedItems = prevCart.items.filter(item => item._id !== itemId);
        return {
          ...prevCart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)
        };
      });

      toast({
        title: 'Removed',
        description: 'Item removed from cart',
      });
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const calculateTotals = () => {
    if (!cart || !cart.items.length) {
      return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }

    const subtotal = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const shipping = subtotal > 1000 ? 0 : 99; // Free shipping above ₹1000
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Cart</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchCart} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Cart Items ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchCart}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {cart.items.map(item => (
          <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.images?.[0]?.alt || item.product.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="96px"
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <Link 
                  href={`/products/${item.product.slug || item.productId}`}
                  className="text-lg font-semibold hover:text-primary transition-colors block truncate"
                >
                  {item.product.name}
                </Link>
                
                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                  {item.size && <p>Size: {item.size}</p>}
                  <p>Material: {item.product.material}</p>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </span>
                  {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.product.comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={updatingItems.has(item._id) || item.quantity <= 1}
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={updatingItems.has(item._id)}
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="font-semibold">
                    ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={updatingItems.has(item._id)}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromCart(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
              <div className="flex flex-col items-end gap-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}