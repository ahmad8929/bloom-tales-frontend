export interface ProductVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
  sku?: string;
}

export interface Product {
  _id?: string; // MongoDB ID
  id?: string; // Alternative ID field
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  slug: string;
  material: string;
  careInstructions: string | string[];
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; // Legacy field, optional now
  isNewArrival: boolean;
  isSale: boolean;
  isStretched?: boolean;
  color?: { name: string; hexCode: string }; // Product-level color (fixed set)
  colors?: ProductColor[]; // Legacy, for backward compatibility
  variants?: ProductVariant[]; // Size + stock variants
  images: ProductImage[];
  video?: string; // Optional video URL
  createdAt?: string;
  updatedAt?: string;
  status?: string; // Product status
  // Virtual fields (computed from variants)
  totalStock?: number;
  availableSizes?: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  // category: string; // REMOVE THIS LINE
  material: string;
  careInstructions: string[];
  // status: 'active' | 'inactive' | 'draft'; // REMOVE THIS LINE
  // featured: boolean; // REMOVE THIS LINE
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; // Legacy field, optional now
  isNewArrival: boolean;
  isSale: boolean;
  isStretched?: boolean;
  color?: { name: string; hexCode: string }; // Product-level color (fixed set)
  colors?: ProductColor[]; // Legacy, for backward compatibility
  variants?: ProductVariant[]; // Size + stock variants
  images: ProductImage[];
}

// export interface ProductSize {
//   size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
//   quantity: number;
// }

export interface ProductColor {
  name: string;
  hexCode: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

// export interface ProductFormData {
//   name: string;
//   description: string;
//   price: number;
//   comparePrice?: number;
//   category: string;
//   material: string;
//   careInstructions: string[];
//   status: 'active' | 'inactive' | 'draft';
//   featured: boolean;
//   sizes: ProductSize[];
//   colors: ProductColor[];
//   images: ProductImage[];
// }

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: ProductColor;
}

export interface CartResponse {
  cart: {
    items: CartItem[];
    total: number;
  };
}

export interface ProductResponse {
  product: Product;
}