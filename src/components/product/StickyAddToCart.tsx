'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import { EASE_LUXE } from '@/lib/motion';
import type { Product } from '@/types/product';

interface StickyAddToCartProps {
  product: Product;
  size: string;
  material?: string;
  disabled?: boolean;
  onBuyNow: () => void;
  onAddSuccess?: () => void;
}

/**
 * Mobile-only bar that slides in once the main purchase section has
 * scrolled out of view, keeping Add to Bag one thumb-tap away.
 */
export function StickyAddToCart({
  product,
  size,
  material,
  disabled,
  onBuyNow,
  onAddSuccess,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.45, ease: EASE_LUXE }}
          className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border px-4 py-3 md:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm text-heading">{product.name}</p>
              <p className="font-sans text-sm font-semibold text-gold">{formatPrice(product.price)}</p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <AddToCartButton
                product={product}
                quantity={1}
                size={size}
                material={material}
                color={product.color || undefined}
                size_prop="sm"
                disabled={disabled}
                onSuccess={onAddSuccess}
              >
                Add to Bag
              </AddToCartButton>
              <Button size="sm" variant="outline" onClick={onBuyNow} disabled={disabled}>
                Buy Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
