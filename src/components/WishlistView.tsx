'use client';

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

export function WishlistView() {
  const { items, isLoading, error } = useWishlist();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-xl text-destructive mb-4">Failed to load wishlist</p>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty.</p>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your wishlist yet. <br />Start browsing to find items you love!</p>
        <Button asChild>
          <Link href="/shop">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {items.map(item => (
        <ProductCard key={item.productId} product={item.product} />
      ))}
    </div>
  );
}
