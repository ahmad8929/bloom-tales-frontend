// Extended color set for products
export const PRODUCT_COLORS = [
  // Light/Pastel Colors
  { name: 'Baby Pink', hexCode: '#F4C2C2' },
  { name: 'Blush Pink', hexCode: '#FFB6C1' },
  { name: 'Peach', hexCode: '#FFCBA4' },
  { name: 'Powder Blue', hexCode: '#B0E0E6' },
  { name: 'Sky Blue', hexCode: '#87CEEB' },
  { name: 'Mint Green', hexCode: '#98FF98' },
  { name: 'Pistachio Green', hexCode: '#93C572' },
  { name: 'Lavender', hexCode: '#E6E6FA' },
  { name: 'Lilac', hexCode: '#C8A2C8' },
  { name: 'Cream', hexCode: '#FFFDD0' },
  { name: 'Off-White / Ivory', hexCode: '#FFFFF0' },
  
  // Rich/Vibrant Colors
  { name: 'Maroon', hexCode: '#800000' },
  { name: 'Wine', hexCode: '#722F37' },
  { name: 'Burgundy', hexCode: '#800020' },
  { name: 'Rani Pink', hexCode: '#E91E63' },
  { name: 'Magenta', hexCode: '#FF00FF' },
  { name: 'Plum', hexCode: '#8B4789' },
  { name: 'Mustard', hexCode: '#FFDB58' },
  { name: 'Turmeric Yellow', hexCode: '#F4C430' },
  { name: 'Mehndi Green', hexCode: '#3D5B3D' },
  { name: 'Bottle Green', hexCode: '#006A4E' },
  
  // Earthy/Natural Colors
  { name: 'Olive Green', hexCode: '#808000' },
  { name: 'Teal', hexCode: '#008080' },
  { name: 'Sea Green', hexCode: '#2E8B57' },
  { name: 'Coffee Brown', hexCode: '#6F4E37' },
  { name: 'Chocolate Brown', hexCode: '#7B3F00' },
  { name: 'Beige', hexCode: '#F5F5DC' },
  { name: 'Sand', hexCode: '#C2B280' },
  { name: 'Taupe', hexCode: '#8B8589' },
  
  // Classic/Dark Colors
  { name: 'Black', hexCode: '#000000' },
  { name: 'Navy Blue', hexCode: '#000080' },
  { name: 'Royal Blue', hexCode: '#4169E1' },
  { name: 'Grey', hexCode: '#808080' },
  { name: 'Charcoal Grey', hexCode: '#36454F' },
  
  // Additional Standard Colors
  { name: 'Red', hexCode: '#EF4444' },
  { name: 'Blue', hexCode: '#3B82F6' },
  { name: 'White', hexCode: '#FFFFFF' },
  { name: 'Green', hexCode: '#10B981' },
  { name: 'Pink', hexCode: '#EC4899' },
  { name: 'Yellow', hexCode: '#FBBF24' }
] as const;

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export type ProductColor = typeof PRODUCT_COLORS[number];
export type ProductSize = typeof PRODUCT_SIZES[number];










