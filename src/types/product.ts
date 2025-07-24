export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  material: string;
  careInstructions: string;
  availableSizes: string[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>; 