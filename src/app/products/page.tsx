'use client';

import { useState, useEffect } from 'react';
import { ShopClient } from "@/components/ShopClient";
import { productApi } from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";
import type { Product } from "@/types/product";

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
      
      const response = await productApi.getAllProducts();

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
      
      setProducts(productsList);
      
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Extract all available sizes for filter options (from variants and legacy size field)
  const allSizes: string[] = [...new Set(
    products.flatMap(p => {
      const sizes: string[] = [];
      // Check variants first
      if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          if (v.size && v.stock > 0 && typeof v.size === 'string') {
            sizes.push(v.size);
          }
        });
      }
      // Fallback to legacy size field
      if (p.size && typeof p.size === 'string') {
        sizes.push(p.size);
      }
      return sizes;
    }).filter((size): size is string => Boolean(size))
  )];

  const pageHeader = (
    <div className="border-b border-border bg-sand/50">
      <div className="container py-14 text-center md:py-20">
        <p className="eyebrow mb-4 animate-fade-up">The Collection</p>
        <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
          Every story, every style
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-up text-text-muted" style={{ animationDelay: '0.2s' }}>
          Discover pieces you&apos;ll love — handpicked sarees, kurtis and modern silhouettes.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        {pageHeader}
        <div className="container py-12">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="hidden space-y-6 lg:block">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 w-16 animate-pulse bg-sand" />
                  <div className="h-24 w-full animate-pulse bg-sand" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] w-full animate-pulse bg-sand" />
                    <div className="h-4 w-3/4 animate-pulse bg-sand" />
                    <div className="h-4 w-1/3 animate-pulse bg-sand" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {pageHeader}
        <div className="container">
          <ErrorState message={error} onRetry={fetchProducts} />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        {pageHeader}
        <div className="container py-24 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="mb-3 font-display text-3xl">The shelves are being dressed</h2>
            <p className="mb-8 text-sm text-text-muted">
              We&apos;re adding new pieces. Check back soon!
            </p>
            <button
              onClick={fetchProducts}
              className="border border-primary/70 px-8 py-3 font-sans text-[12px] font-semibold uppercase tracking-luxe text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {pageHeader}
      <div className="container py-12 md:py-16">
        <ShopClient
          products={products}
          allSizes={allSizes}
        />
      </div>
    </div>
  );
}