'use client';

import { useState, useEffect } from 'react';
import { ShopClient } from "@/components/ShopClient";
import { productApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt?: string }>;
  size: string;
  material: string;
  isNewArrival: boolean;
  isSale: boolean;
  slug: string;
  createdAt?: string;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all products...');
      const response = await productApi.getAllProducts();
      console.log('Products API response:', response);
      
      // Handle different response structures
      let productsList: Product[] = [];
      
      if (response.data?.data?.products) {
        // Standard API response structure: { data: { data: { products: [...] } } }
        const productsData = response.data.data.products;
        // Ensure products is always an array
        productsList = Array.isArray(productsData) ? productsData : [];
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response: { data: [...] }
        productsList = response.data;
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        // If no products found but no error, set empty array
        productsList = [];
      }
      
      console.log('Processed products:', productsList);
      setProducts(productsList);
      
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Extract all available sizes and materials for filter options
  const allSizes: string[] = [...new Set(
    products
      .map(p => p.size)
      .filter((size): size is string => Boolean(size) && typeof size === 'string')
  )];

  const allMaterials: string[] = [...new Set(
    products
      .map(p => p.material)
      .filter((material): material is string => Boolean(material) && typeof material === 'string')
  )];

  console.log('All sizes:', allSizes);
  console.log('All materials:', allMaterials);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover pieces you'll love, for every story and every style.
          </p>
        </div>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover pieces you'll love, for every story and every style.
          </p>
        </div>
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Products</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button 
              onClick={fetchProducts}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Discover pieces you'll love, for every story and every style.
          </p>
        </div>
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
            <p className="text-muted-foreground mb-6">
              We're working on adding new products. Check back soon!
            </p>
            <button 
              onClick={fetchProducts}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover pieces you'll love, for every story and every style.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          {products.length} products available
        </div>
      </div>
      
      <ShopClient 
        products={products} 
        allSizes={allSizes}
        allMaterials={allMaterials}
      />
    </div>
  );
}