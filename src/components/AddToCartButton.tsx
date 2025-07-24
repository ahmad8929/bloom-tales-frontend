'use client';

import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ComponentProps } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface AddToCartButtonProps extends Omit<ButtonProps, 'size'> {
  product: Product;
  productSize?: string;
  quantity?: number;
  buttonSize?: ButtonProps['size'];
}

export function AddToCartButton({ 
  product, 
  productSize, 
  quantity = 1,
  className, 
  children,
  buttonSize,
  ...props 
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if the button is inside a link
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        size: productSize,
        product
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (children) {
     return (
        <Button 
          onClick={handleAddToCart} 
          className={className}
          size={buttonSize}
          disabled={isLoading}
          {...props}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {children}
        </Button>
    )
  }

  return (
    <Button 
      size="icon" 
      variant="outline" 
      onClick={handleAddToCart} 
      disabled={isLoading}
      className={cn(className)} 
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="h-5 w-5" />
      )}
      <span className="sr-only">Add to cart</span>
    </Button>
  );
}
