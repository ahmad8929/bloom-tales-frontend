'use client';

import { PRODUCT_SIZES } from '@/lib/constants';
import type { Product } from '@/types/product';

interface SizeSelectorProps {
  product: Product;
  selectedSize: string;
  onSelect: (size: string) => void;
}

export function SizeSelector({ product, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Size</p>
        <span className="font-sans text-xs text-text-muted">Need help? See size guide below</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRODUCT_SIZES.map((size) => {
          const variant = product.variants?.find((v: any) => v?.size === size);
          const stock = variant ? variant.stock ?? 0 : 0;
          const isAvailable = stock > 0;
          const isSelected = selectedSize === size;

          return (
            <div key={size} className="group relative">
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelect(size)}
                className={`flex h-11 min-w-[3rem] items-center justify-center border px-4 font-sans text-sm font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary'
                } ${!isAvailable ? 'cursor-not-allowed opacity-30 line-through' : ''}`}
              >
                {size}
              </button>

              {!isAvailable && (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-ivory opacity-0 transition-opacity group-hover:opacity-100">
                  Out of stock
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
