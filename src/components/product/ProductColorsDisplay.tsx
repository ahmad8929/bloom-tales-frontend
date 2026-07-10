import type { Product, ProductColor } from '@/types/product';

export function ProductColorsDisplay({ product }: { product: Product }) {
  const colors: ProductColor[] =
    product.colors && product.colors.length > 0
      ? product.colors
      : product.color
        ? [product.color]
        : [];

  if (colors.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="eyebrow">{colors.length > 1 ? 'Colours' : 'Colour'}</p>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 border border-border px-3.5 py-2 transition-colors hover:border-gold"
          >
            <div
              className="h-5 w-5 rounded-full border border-border shadow-inner"
              style={{ backgroundColor: color.hexCode }}
            />
            <span className="font-sans text-sm font-medium">{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
