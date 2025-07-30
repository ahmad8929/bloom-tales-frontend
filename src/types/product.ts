export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  // category: string; // REMOVE THIS LINE
  slug: string;
  material: string;
  careInstructions: string[];
  // status: 'active' | 'inactive' | 'draft'; // REMOVE THIS LINE
  // featured: boolean; // REMOVE THIS LINE
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; // ADD THIS - single size instead of sizes array
  isNewArrival: boolean; // ADD THIS
  isSale: boolean; // ADD THIS
  colors: ProductColor[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
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
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'; // ADD THIS - single size instead of sizes array
  isNewArrival: boolean; // ADD THIS
  isSale: boolean; // ADD THIS
  colors: ProductColor[];
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