'use client';

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';

export function WishlistView() {
  const { wishlistItems, itemCount } = useWishlist();

  if (itemCount === 0) {
    return (
      <div className="text-center">
        <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty.</p>
        <p className="text-muted-foreground mb-6">Looks like you haven’t added anything to your wishlist yet. <br />Start browsing to find items you love!</p>
        <Button asChild>
          <Link href="/shop">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {wishlistItems.map(item => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}
