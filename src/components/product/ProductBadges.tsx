import type { Product } from '@/types/product';

interface ProductBadgesProps {
  product: Product;
  discountPercentage: number;
}

export function ProductBadges({ product, discountPercentage }: ProductBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {product.isNewArrival && (
        <span className="bg-sand px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-luxe text-heading">
          New Arrival
        </span>
      )}
      {product.isSale && (
        <span className="bg-gold px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-luxe text-white">
          On Sale
        </span>
      )}
      {product.isStretched && (
        <span className="border border-border px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-luxe text-text-muted">
          Already Stretched
        </span>
      )}
      {discountPercentage > 0 && (
        <span className="bg-gold px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-luxe text-white">
          −{discountPercentage}%
        </span>
      )}
    </div>
  );
}
