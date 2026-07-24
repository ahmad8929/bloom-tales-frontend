'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

// Mirrors WhatsAppButton's footer-avoidance mechanism, mirrored to the
// opposite corner so the two buttons never overlap.
const MOBILE_CLEARANCE = 96 + 56;
const DESKTOP_CLEARANCE = 20 + 56;
const MD_BREAKPOINT = 768;
const GAP = 16;

export function FloatingCartButton() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    let raf = 0;
    const recalc = () => {
      raf = 0;
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      const clearance = window.innerWidth >= MD_BREAKPOINT ? DESKTOP_CLEARANCE : MOBILE_CLEARANCE;
      setLift(Math.max(0, overlap - clearance + GAP));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(recalc);
    };

    recalc();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
