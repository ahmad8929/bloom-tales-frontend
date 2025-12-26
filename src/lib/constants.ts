// Fixed color set for products (7 predefined colors)
export const PRODUCT_COLORS = [
  { name: 'Red', hexCode: '#EF4444' },
  { name: 'Blue', hexCode: '#3B82F6' },
  { name: 'Black', hexCode: '#000000' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Green', hexCode: '#10B981' },
  { name: 'Pink', hexCode: '#EC4899' },
  { name: 'Yellow', hexCode: '#FBBF24' }
] as const;

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export type ProductColor = typeof PRODUCT_COLORS[number];
export type ProductSize = typeof PRODUCT_SIZES[number];







