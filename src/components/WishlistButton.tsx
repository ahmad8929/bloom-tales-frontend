'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.82 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center bg-ivory/90 transition-colors duration-300 hover:bg-ivory',
        active ? 'text-gold' : 'text-heading hover:text-gold',
        className
      )}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      >
        <Heart className="h-3.5 w-3.5" strokeWidth={1.5} fill={active ? 'currentColor' : 'none'} />
      </motion.span>
    </motion.button>
  );
}
