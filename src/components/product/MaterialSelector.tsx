'use client';

interface CartItemLike {
  product?: { _id?: string; id?: string };
  productId?: string;
  size?: string;
  material?: string;
  quantity?: number;
}

interface MaterialSelectorProps {
  materials: string[];
  selectedMaterial: string;
  onSelect: (material: string) => void;
  /** Used to badge materials already present in the cart */
  productId: string;
  productSize?: string;
  selectedSize: string;
  cartItems?: CartItemLike[];
}

export function MaterialSelector({
  materials,
  selectedMaterial,
  onSelect,
  productId,
  productSize,
  selectedSize,
  cartItems,
}: MaterialSelectorProps) {
  if (materials.length === 0) return null;

  const sizeToMatch = selectedSize || productSize || 'L';

  return (
    <div className="space-y-3">
      <p className="eyebrow">
        Select Material <span className="normal-case tracking-normal text-destructive">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {materials.map((material, index) => {
          const isSelected = selectedMaterial === material;
          const materialInCart = cartItems?.find((item) => {
            const itemProductId = item.product?._id || item.product?.id || item.productId;
            const itemSize = item.size || productSize || 'L';
            return (
              itemProductId === productId &&
              itemSize === sizeToMatch &&
              (item.material || '') === material
            );
          });

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(material)}
              className={`relative border px-4 py-2.5 font-sans text-sm font-medium transition-all duration-300 ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-text-normal hover:border-primary'
              }`}
            >
              {material}
              {materialInCart && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {materialInCart.quantity || 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedMaterial && (
        <p className="text-sm text-text-muted">
          Selected: <span className="font-medium text-heading">{selectedMaterial}</span>
        </p>
      )}
    </div>
  );
}
