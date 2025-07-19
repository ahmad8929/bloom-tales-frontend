'use client';

import type { ClothingItem } from '@/ai/flows/ai-style-recommendation';
import { Button, ButtonProps } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistButtonProps extends ButtonProps {
  product: ClothingItem;
}

export function WishlistButton({ product, className, ...props }: WishlistButtonProps) {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <Button 
      size="icon" 
      variant="secondary" 
      onClick={handleWishlistToggle} 
      className={cn(className)} 
      {...props}
    >
        <Heart className={cn("h-4 w-4", isInWishlist && "fill-primary text-primary")} />
        <span className="sr-only">Toggle Wishlist</span>
    </Button>
  );
}
