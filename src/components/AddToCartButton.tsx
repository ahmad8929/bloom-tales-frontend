'use client';

import type { ClothingItem } from '@/ai/flows/ai-style-recommendation';
import { Button, ButtonProps } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps extends ButtonProps {
  product: ClothingItem;
}

export function AddToCartButton({ product, className, children, ...props }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation if the button is inside a link
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (children) {
     return (
        <Button onClick={handleAddToCart} className={className} {...props}>
            {children}
        </Button>
    )
  }

  return (
    <Button size="icon" variant="outline" onClick={handleAddToCart} className={cn(className)} {...props}>
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">Add to cart</span>
    </Button>
  );
}
