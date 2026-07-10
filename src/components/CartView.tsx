'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ErrorState } from '@/components/ErrorState';
import { cartApi } from '@/lib/api';
import { RootState } from '@/store';
import { updateCartItemLocal, removeFromCartLocal } from '@/store/slices/cartSlice';
import { useCart } from '@/hooks/useCart';
import type { CartItem } from '@/types/cart';

// Interface for API cart item response (different from Redux CartItem)
interface ApiCartItem {
  _id: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: {
    name: string;
    hexCode: string;
  };
  material?: string; // Selected material tag
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
  items: ApiCartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export function CartView() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cartItems: reduxCartItems } = useCart();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isGuestCart, setIsGuestCart] = useState(false);

  const loadGuestCart = useCallback(() => {
    setIsLoading(true);
    setIsGuestCart(true);
    
    if (reduxCartItems && reduxCartItems.length > 0) {
      // Convert Redux cart items to CartData format
      const guestCartData: CartData = {
        _id: 'guest-cart',
        userId: 'guest',
        items: reduxCartItems.map((item: CartItem, index: number) => ({
          _id: `guest-item-${index}`,
          productId: item.product.id || item.product._id || '',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          material: item.material,
          product: {
            _id: item.product._id || item.product.id || '',
            name: item.product.name,
            price: item.product.price,
            comparePrice: item.product.comparePrice,
            images: item.product.images || [],
            size: item.product.size || item.size || 'L',
            material: item.product.material || '',
            slug: item.product.slug || '',
          },
        })),
        totalItems: reduxCartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: reduxCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCart(guestCartData);
      setError(null);
    } else {
      setCart(null);
      setError(null);
    }
    setIsLoading(false);
  }, [reduxCartItems]);

  // Fetch cart data
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // For guest users, use Redux state
      loadGuestCart();
    }
  }, [isAuthenticated, loadGuestCart]);

 const fetchCart = async () => {
  try {
    setIsLoading(true);
    setIsGuestCart(false);
    setError(null);
    const response = await cartApi.getCart();
    
    if (response.error) {
      throw new Error(response.error);
    }

    // Handle the API response structure: { status: string; data: { cart: {...} } }
    const cartData = response.data?.data?.cart || null;
    
    // Ensure items is always an array, even if empty
    if (cartData && !Array.isArray(cartData.items)) {
      cartData.items = [];
    }
    
    setCart(cartData);
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    const errorMessage = error.message || 'Failed to load cart';
    
    // Handle authentication errors silently by falling back to guest cart
    if (errorMessage.includes('Access denied') || 
        errorMessage.includes('No token provided') ||
        errorMessage.includes('token') ||
        errorMessage.includes('Authentication failed') ||
        errorMessage.includes('Unauthorized')) {
      // Silently fall back to guest cart mode
      loadGuestCart();
      return;
    }
    
    // For other errors, show error message
    setError(errorMessage);
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
      if (isGuestCart) {
        // For guest cart, update Redux state
        const cartItem = cart?.items.find(item => item && item._id === itemId);
        if (cartItem && cartItem.productId) {
          const productId = cartItem.productId;
          dispatch(updateCartItemLocal({ productId, quantity: newQuantity }));
          
          // Reload guest cart to reflect changes
          loadGuestCart();
          
          toast({
            title: 'Updated',
            description: 'Cart item quantity updated',
          });
        }
      } else {
        // For authenticated users, use API
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
      }
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
      if (isGuestCart) {
        // For guest cart, update Redux state
        const cartItem = cart?.items.find(item => item && item._id === itemId);
        if (cartItem && cartItem.productId) {
          const productId = cartItem.productId;
          dispatch(removeFromCartLocal(productId));
          
          // Reload guest cart to reflect changes
          loadGuestCart();
          
          toast({
            title: 'Removed',
            description: 'Item removed from cart',
          });
        }
      } else {
        // For authenticated users, use API
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
      }
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
      return { subtotal: 0, total: 0 };
    }

    const subtotal = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * (item.product?.price || 0), 0);
    const total = subtotal; // Total is just the subtotal

    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        compact
        title="Your cart is taking a moment"
        message={error}
        onRetry={fetchCart}
        secondaryAction={{ label: 'Continue Shopping', href: '/products' }}
      />
    );
  }

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    return (
      <div className="border border-dashed border-border py-24 text-center">
        <div className="mx-auto max-w-md px-6">
          <ShoppingBag className="mx-auto mb-6 h-12 w-12 text-gold" strokeWidth={1} />
          <h2 className="mb-3 font-display text-3xl">Your bag is empty</h2>
          <p className="mb-8 text-sm leading-relaxed text-text-muted">
            Beautiful things are waiting. Explore the collection and find something to love.
          </p>
          <Button asChild size="lg">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
      <div className="lg:col-span-2">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
          <h2 className="font-display text-2xl">
            {cart.totalItems} {cart.totalItems === 1 ? 'piece' : 'pieces'}
          </h2>
          {!isGuestCart ? (
            <button
              onClick={fetchCart}
              className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-luxe text-text-muted transition-colors hover:text-gold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          ) : (
            <div className="font-sans text-sm text-text-muted">
              <Link href="/login" className="text-gold hover:underline">
                Log in
              </Link>
              {' to save your bag'}
            </div>
          )}
        </div>

        <div className="divide-y divide-border">
          {cart.items.map(item => (
            <div key={item._id} className="flex gap-4 py-6 sm:gap-6">
              {/* Product Image */}
              <Link
                href={`/products/${item.product._id || item.productId}`}
                className="img-zoom relative block h-32 w-24 flex-shrink-0 overflow-hidden bg-sand sm:h-40 sm:w-32"
              >
                <Image
                  src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.images?.[0]?.alt || item.product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                  priority
                />
              </Link>

              {/* Product Details */}
              <div className="flex min-w-0 flex-grow flex-col justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.product._id || item.productId}`}
                    className="mb-1.5 line-clamp-2 block font-display text-base leading-snug text-heading transition-colors hover:text-gold sm:text-lg"
                  >
                    {item.product.name}
                  </Link>

                  <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-text-muted">
                    {item.size && (
                      <span>
                        Size <span className="font-semibold text-heading">{item.size}</span>
                      </span>
                    )}
                    {item.color && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: item.color.hexCode }}
                          title={item.color.name}
                        />
                        {item.color.name}
                      </span>
                    )}
                    {item.material && (
                      <span>
                        Material <span className="font-semibold text-heading">{item.material}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-sm font-semibold text-heading sm:text-base">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="font-sans text-xs text-text-muted line-through">
                        ₹{item.product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity + actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center border border-border">
                    <button
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-sand disabled:opacity-40"
                      disabled={updatingItems.has(item._id)}
                      aria-label="Decrease quantity"
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item._id);
                        } else {
                          updateQuantity(item._id, item.quantity - 1);
                        }
                      }}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-sans text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-sand disabled:opacity-40"
                      disabled={updatingItems.has(item._id)}
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5">
                    <p className="font-sans text-sm font-semibold text-heading">
                      ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                    </p>
                    <button
                      className="text-text-muted transition-colors hover:text-destructive disabled:opacity-40"
                      disabled={updatingItems.has(item._id)}
                      onClick={() => removeFromCart(item._id)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit lg:sticky lg:top-28">
        <div className="border border-border bg-card p-6 sm:p-8">
          <h3 className="mb-6 font-display text-2xl">Order Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between font-sans text-sm">
              <span className="text-text-muted">Subtotal ({cart.totalItems} items)</span>
              <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="hairline" />
            <div className="flex justify-between font-sans text-base">
              <span className="font-semibold uppercase tracking-wide">Total</span>
              <span className="font-display text-xl font-semibold">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {isGuestCart ? (
              <>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/login?returnUrl=/checkout">
                    Log in to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </>
            )}
          </div>
          <p className="mt-6 text-center font-sans text-[11px] uppercase tracking-luxe text-text-muted">
            Secure checkout · Quality assured
          </p>
        </div>
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