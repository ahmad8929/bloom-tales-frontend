'use client';

import { CartProvider } from '@/context/CartProvider';
import { WishlistProvider } from '@/context/WishlistProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
