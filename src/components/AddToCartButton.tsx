'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi, productApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { RootState } from '@/store';
import { addToCartLocal } from '@/store/slices/cartSlice';
import type { Product } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  size?: string;
  color?: { name: string; hexCode: string } | null;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size_prop?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  size,
  color,
  variant = 'default',
  size_prop = 'default',
  className,
  children,
  onSuccess,
  disabled = false
}: AddToCartButtonProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    // Prevent event bubbling if clicked inside a card
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (disabled || isLoading || isAdded) return;

    setIsLoading(true);
    
    try {
      const productId = (product as any)._id || product.id;
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Default to "L" if no size is provided
      const finalSize = size || product.size || 'L';
      
      console.log('Adding to cart:', { productId, quantity, size: finalSize, color, isAuthenticated });

      if (isAuthenticated) {
        // User is logged in - add to server cart
        const response = await cartApi.addToCart(
          productId, 
          quantity, 
          finalSize,
          color
        );
        
        console.log('Add to cart response:', response);
        
        if (response.error) {
          throw new Error(response.error);
        }

        setIsAdded(true);
        
        // Reset success state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);

        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
        });

        // Trigger cart refresh event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { action: 'add', productId, quantity }
        }));

        // Call success callback if provided
        onSuccess?.();
      } else {
        // Guest user - add to local cart (Redux state, persisted via redux-persist)
        const cartItem = {
          product: {
            ...product,
            id: productId,
            _id: productId,
          },
          quantity,
          size: finalSize,
          color: color || product.color || undefined,
        };

        dispatch(addToCartLocal(cartItem as any));

        setIsAdded(true);
        
        // Reset success state after 2 seconds
        setTimeout(() => setIsAdded(false), 2000);

        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
        });

        // Trigger cart refresh event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { action: 'add', productId, quantity }
        }));

        // Call success callback if provided
        onSuccess?.();
      }
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      const errorMessage = error.message || error.error || 'Failed to add item to cart';
      
      // Handle authentication/authorization errors (shouldn't happen for guest users now)
      const isAuthError = 
        errorMessage.toLowerCase().includes('access denied') ||
        errorMessage.toLowerCase().includes('authentication required') ||
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('login required') ||
        errorMessage.toLowerCase().includes('token') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403');
      
      if (isAuthError && isAuthenticated) {
        // Only redirect if user was authenticated but token expired
        toast({
          title: 'Session Expired',
          description: 'Please log in again to continue.',
          variant: 'destructive',
        });
        
        // Redirect to login page with returnUrl
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          setTimeout(() => {
            router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
          }, 500);
        }
      } else if (errorMessage.includes('stock') || errorMessage.includes('availability')) {
        toast({
          title: 'Out of Stock',
          description: 'This item is currently out of stock.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      );
    }
    
    if (isAdded) {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added!
        </>
      );
    }
    
    if (children) {
      return children;
    }
    
    return (
      <>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </>
    );
  };

  return (
    <Button
      variant={variant}
      size={size_prop}
      onClick={handleAddToCart}
      disabled={disabled || isLoading || isAdded}
      className={cn(
        'transition-all duration-200',
        isAdded && 'bg-green-600 hover:bg-green-600',
        className
      )}
    >
      {buttonContent()}
    </Button>
  );
}