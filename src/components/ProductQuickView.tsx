'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AddToCartButton } from '@/components/AddToCartButton';
import { formatPrice, getPrimaryImage, getDiscountPercentage } from '@/lib/format';
import { scaleIn } from '@/lib/motion';

interface ProductQuickViewProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  if (!product) return null;

  const productId = product._id || product.id;
  const discount = getDiscountPercentage(product.price, product.comparePrice);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <motion.div variants={scaleIn} initial="hidden" animate="show" className="grid sm:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-sand">
            <Image
              src={getPrimaryImage(product)}
              alt={product.name || 'Product'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 90vw, 380px"
            />
            {discount > 0 && (
              <span className="absolute left-3 top-3 bg-gold px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-luxe text-white">
                −{discount}%
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <DialogTitle asChild>
              <h3 className="font-display text-2xl font-medium leading-snug text-heading">
                {product.name}
              </h3>
            </DialogTitle>

            <div className="flex items-baseline gap-2">
              <span className="font-sans text-xl font-semibold text-gold">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <span className="font-sans text-sm text-text-muted line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="line-clamp-3 text-sm leading-relaxed text-text-muted">
                {product.description}
              </p>
            )}

            {product.material && (
              <p className="font-sans text-xs uppercase tracking-luxe text-text-muted">
                Material · <span className="text-heading">{product.material}</span>
              </p>
            )}

            <div className="mt-2 space-y-3">
              <AddToCartButton product={product} className="w-full" size_prop="default">
                Add to Bag
              </AddToCartButton>
              <Link
                href={`/products/${productId}`}
                className="group flex items-center justify-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-luxe text-heading transition-colors hover:text-gold"
                onClick={() => onOpenChange(false)}
              >
                View Full Details
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
