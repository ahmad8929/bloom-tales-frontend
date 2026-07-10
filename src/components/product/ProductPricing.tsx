import { IndianRupee } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductPricingProps {
  product: Product;
  savings: number;
}

export function ProductPricing({ product, savings }: ProductPricingProps) {
  const hasDiscount = savings > 0;

  return (
    <div className="space-y-1.5 border-y border-border py-5">
      <div className="flex items-baseline gap-3">
        <div className="flex items-center font-sans text-3xl font-semibold text-gold">
          <IndianRupee className="mr-0.5 h-6 w-6" />
          {product.price.toLocaleString('en-IN')}
        </div>
        {hasDiscount && (
          <div className="font-sans text-lg text-text-muted line-through">
            ₹{product.comparePrice?.toLocaleString('en-IN')}
          </div>
        )}
      </div>
      {hasDiscount && (
        <p className="font-sans text-sm font-medium text-gold">
          You save ₹{savings.toLocaleString('en-IN')}
        </p>
      )}
      <p className="font-sans text-xs text-text-muted">Inclusive of all taxes</p>
    </div>
  );
}
