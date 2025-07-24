'use client';

import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentProps, useState } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

interface WishlistButtonProps extends Omit<ButtonProps, 'size'> {
  product: Product;
  buttonSize?: ButtonProps['size'];
}

export function WishlistButton({ 
  product, 
  className, 
  buttonSize = 'icon',
  ...props 
}: WishlistButtonProps) {
  const { items, addToWishlist, removeFromWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const isInWishlist = items.some(item => item.productId === product.id);

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size={buttonSize}
      variant="secondary" 
      onClick={handleWishlistToggle} 
      className={cn(className)} 
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", isInWishlist && "fill-primary text-primary")} />
      )}
      <span className="sr-only">
        {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      </span>
    </Button>
  );
}
