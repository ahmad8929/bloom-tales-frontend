'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cartApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  size: string;
  material?: string;
  images?: Array<{ url: string; alt?: string }>;
}

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  size?: string;
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
  variant = 'default',
  size_prop = 'default',
  className,
  children,
  onSuccess,
  disabled = false
}: AddToCartButtonProps) {
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
      const productId = product._id || product.id;
      if (!productId) {
        throw new Error('Product ID is required');
      }

      console.log('Adding to cart:', { productId, quantity, size: size || product.size });

      const response = await cartApi.addToCart(
        productId, 
        quantity, 
        size || product.size
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
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Failed to add item to cart';
      
      // Handle specific error cases
      if (error.message.includes('authentication') || error.message.includes('login')) {
        errorMessage = 'Please log in to add items to cart';
      } else if (error.message.includes('stock') || error.message.includes('availability')) {
        errorMessage = 'This item is currently out of stock';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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