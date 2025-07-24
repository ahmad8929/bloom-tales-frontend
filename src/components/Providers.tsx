'use client';

import { CartProvider } from '@/context/CartProvider';
import { WishlistProvider } from '@/context/WishlistProvider';
import { AuthProvider } from '@/context/AuthProvider'; // ✅ Add this import

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
