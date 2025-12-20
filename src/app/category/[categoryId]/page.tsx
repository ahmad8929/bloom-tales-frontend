'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShopClient } from "@/components/ShopClient";
import { productApi } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt?: string }>;
  size: string;
  material: string;
  category: string;
  isNewArrival: boolean;
  isSale: boolean;
  slug: string;
  createdAt?: string;
  description?: string;
}

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');

  const categoryId = params.categoryId as string;

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory(categoryId);
    }
  }, [categoryId]);

  const fetchProductsByCategory = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING PRODUCTS FOR CATEGORY ===');
      console.log('Category slug:', slug);
      
      // Convert slug back to category name for display
      const categoryNameFromSlug = slug.replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log('Category name for display:', categoryNameFromSlug);
      
      // Call the CORRECT category API endpoint
      const response = await productApi.getProductsByCategory(slug, { 
        limit: '1000'
      });
      
      console.log('=== CATEGORY API RESPONSE ===');
      console.log('Full response:', response);
      
      let categoryProducts: Product[] = [];
      let allProducts: Product[] = [];
      let finalCategoryName = categoryNameFromSlug;
      
      if (response.error) {
        console.error('Category API returned error:', response.error);
        
        // Fallback: get all products and filter client-side
        console.log('Attempting fallback: get all products and filter...');
        const allProductsResponse = await productApi.getAllProducts({ limit: '1000' });
        
        if (allProductsResponse.error) {
          throw new Error(`Failed to fetch products: ${response.error}`);
        }
        
        if (allProductsResponse.data?.data?.products) {
          const productsData = allProductsResponse.data.data.products;
          // Ensure products is always an array
          allProducts = Array.isArray(productsData) ? productsData : [];
          console.log('Total products fetched for filtering:', allProducts.length);
          
          // Log all unique categories for debugging
          const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
          console.log('Available categories:', uniqueCategories);
          
          categoryProducts = allProducts.filter(product => {
            const productCategory = product.category?.toLowerCase().replace(/\s+/g, '-');
            const matches = productCategory === slug.toLowerCase();
            if (matches) {
              console.log(`Product "${product.name}" matches category "${slug}"`);
            }
            return matches;
          });
          
          console.log('Client-side filtered products:', categoryProducts.length);
          
          if (categoryProducts.length > 0 && categoryProducts[0].category) {
            finalCategoryName = categoryProducts[0].category;
          }
        } else {
          // No products available, set empty arrays
          allProducts = [];
          categoryProducts = [];
        }
      } else if (response.data?.data?.products) {
        const productsData = response.data.data.products;
        // Ensure products is always an array
        categoryProducts = Array.isArray(productsData) ? productsData : [];
        console.log('Products from category API:', categoryProducts.length);
        
        if (categoryProducts.length > 0 && categoryProducts[0].category) {
          finalCategoryName = categoryProducts[0].category;
        }
        
        // Also get all products for filter options
        const allProductsResponse = await productApi.getAllProducts({ limit: '1000' });
        if (allProductsResponse.data?.data?.products) {
          const allProductsData = allProductsResponse.data.data.products;
          allProducts = Array.isArray(allProductsData) ? allProductsData : [];
        } else {
          allProducts = [];
        }
      } else {
        // No products in response, set empty arrays
        categoryProducts = [];
        allProducts = [];
      }
      
      // Don't set error for empty arrays - just display "No data available" message
      // The component will handle empty arrays gracefully
      
      setCategoryName(finalCategoryName);
      setProducts(allProducts.length > 0 ? allProducts : categoryProducts);
      setFilteredProducts(categoryProducts);
      
      console.log('=== FINAL STATE ===');
      console.log('Category name:', finalCategoryName);
      console.log('All products count:', allProducts.length);
      console.log('Filtered products count:', categoryProducts.length);
      
    } catch (error: any) {
      console.error('=== ERROR IN FETCH ===');
      console.error('Error details:', error);
      setError(`Failed to load products: ${error.message || error}`);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Loading {categoryId}...</h1>
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
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Products
          </Button>
        </div>
        
        <div className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Products</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => fetchProductsByCategory(categoryId)}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/products')}>
                View All Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Products
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">{categoryName} Collection</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore our {categoryName.toLowerCase()} collection
          </p>
        </div>
        
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
            <p className="text-muted-foreground mb-6">
              We don't have any {categoryName.toLowerCase()} products available right now. Check back soon!
            </p>
            <Button onClick={() => router.push('/products')}>
              View All Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/products')}
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Products
        </Button>
      </div>
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{categoryName} Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover our stunning {categoryName.toLowerCase()} collection, designed with elegance and style in mind.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-1 w-12 bg-primary rounded-full"></div>
          <span className="text-sm text-muted-foreground font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
          </span>
          <div className="h-1 w-12 bg-primary rounded-full"></div>
        </div>
      </div>
      
      {/* Products */}
      <ShopClient 
        products={filteredProducts} 
        allSizes={allSizes}
        allMaterials={allMaterials}
      />
    </div>
  );
}