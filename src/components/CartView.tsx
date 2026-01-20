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

    const subtotal = cart.totalAmount || cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const total = subtotal; // Total is just the subtotal

    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

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

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
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
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Cart Items ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
          </h2>
          {!isGuestCart && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCart}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
          {isGuestCart && (
            <div className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
              {' to save your cart'}
            </div>
          )}
        </div>

        {cart.items.map(item => (
          <Card key={item._id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
              {/* Product Image - Fixed size on mobile */}
              <Link 
                href={`/products/${item.product._id || item.productId}`}
                className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200"
              >
                <Image
                  src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.images?.[0]?.alt || item.product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                  priority
                />
              </Link>
              
              {/* Product Details */}
              <div className="flex-grow min-w-0 flex flex-col gap-2 sm:gap-3">
                {/* Product Info Section */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/products/${item.product._id || item.productId}`}
                    className="text-sm sm:text-base font-semibold hover:text-primary transition-colors block line-clamp-2 mb-1.5"
                  >
                    {item.product.name}
                  </Link>
                  
                  <div className="text-xs text-muted-foreground space-y-0.5 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.size && (
                        <span className="inline-flex items-center gap-1">
                          <span>Size:</span>
                          <span className="font-medium text-foreground">{item.size}</span>
                        </span>
                      )}
                      {item.color && (
                        <div className="flex items-center gap-1.5">
                          <span>Color:</span>
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: item.color.hexCode }}
                            title={item.color.name}
                          />
                          <span className="font-medium text-foreground text-xs">{item.color.name}</span>
                        </div>
                      )}
                      {item.material && (
                        <span className="inline-flex items-center gap-1">
                          <span>Material:</span>
                          <span className="font-medium text-foreground">{item.material}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{item.product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity and Actions Section */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2 border-t">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                      disabled={updatingItems.has(item._id)}
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item._id);
                        } else {
                          updateQuantity(item._id, item.quantity - 1);
                        }
                      }}
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <span className="w-8 sm:w-10 text-center font-medium text-xs sm:text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                      disabled={updatingItems.has(item._id)}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  
                  {/* Subtotal and Delete */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Subtotal</p>
                      <p className="font-semibold text-xs sm:text-sm text-foreground">
                        ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive shrink-0"
                      disabled={updatingItems.has(item._id)}
                      onClick={() => removeFromCart(item._id)}
                      title="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex justify-between text-sm sm:text-base">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base sm:text-lg font-semibold">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4">
            {isGuestCart ? (
              <>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/login?returnUrl=/checkout">
                    Log in to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
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
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </>
            )}
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