'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFooterLift } from '@/hooks/useFooterLift';

// Shares WhatsAppButton's footer-avoidance mechanism, mirrored to the
// opposite corner so the two buttons never overlap.
export function FloatingCartButton() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const lift = useFooterLift();

  const hideOnCurrentRoute = pathname === '/cart' || pathname?.startsWith('/checkout');
  if (hideOnCurrentRoute || itemCount === 0) return null;

  return (
    <Link
      href="/cart"
      aria-label={`View bag, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      style={lift ? { transform: `translateY(-${lift}px)` } : undefined}
      className="fixed bottom-24 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg shadow-ink/25 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:shadow-xl active:scale-95 md:bottom-5 md:left-5"
    >
      <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
      <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 font-sans text-[10px] font-bold text-white">
        {itemCount > 99 ? '99+' : itemCount}
      </span>
    </Link>
  );
}
