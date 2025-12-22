'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cartApi } from '@/lib/api';

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
}

interface FeaturedProductsProps {
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export function FeaturedProducts({ 
  limit = 12, 
  title = "Featured Products", 
  showViewAll = true
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  // Fetch cart items for authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await cartApi.getCart();
        if (response.data?.data?.cart?.items) {
          setCartItems(response.data.data.cart.items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.log('Cart fetch failed:', error);
        setCartItems([]);
      }
    };

    fetchCart();

    const handleCartUpdate = () => {
      if (isAuthenticated) {
        fetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await productApi.getAllProducts({ limit: String(limit) });
      
      let productsList: Product[] = [];
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Check for nested data structure
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const nestedData = (response.data as any).data;
        if (nestedData && typeof nestedData === 'object' && 'products' in nestedData) {
          productsList = (nestedData.products || []).slice(0, limit);
        }
      } 
      else if (response.data && Array.isArray((response.data as any))) {
        productsList = (response.data as any).slice(0, limit);
      }
      else if (response.data && typeof response.data === 'object' && 'products' in (response.data as any)) {
        productsList = ((response.data as any).products || []).slice(0, limit);
      }
      
      setProducts(productsList);
      
    } catch (error: any) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-hover/30 rounded-full blur-lg animate-bounce"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-primary/25 mb-6">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            {/* <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2> */}
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground font-medium">Loading products...</span>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-hover/30 rounded-full blur-lg animate-bounce"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-primary/25 mb-6">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            {/* <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2> */}
          </div>
          <p className="text-lg text-foreground py-12 font-medium">No products available at the moment.</p>
          <p className="text-sm text-muted-foreground">Check back soon for our latest collections!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-hover/30 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 md:w-20 h-12 md:h-20 bg-primary/20 rounded-full blur-md animate-pulse delay-100"></div>
        <div className="absolute top-1/3 right-1/3 w-8 md:w-16 h-8 md:h-16 bg-hover/20 rounded-full blur-sm animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        {/* <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-primary/25 mb-6 md:mb-8 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 backdrop-blur-lg">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2>
          </div>
          <p className="text-foreground text-sm md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-medium mb-6">
            Explore our handpicked collection of premium products
          </p>
        </div> */}

        {/* Products Grid */}
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-4 px-2 sm:px-1 md:px-0">

   {products.map((product) => (
            <ProductCard 
              key={product._id || product.id} 
              product={product} 
              cartItems={cartItems}
            />
          ))}
        </div>

        {/* View All Button - Centered */}
        {showViewAll && (
          <div className="text-center mt-12 md:mt-16">
            <Button 
              asChild 
              className="bg-primary hover:bg-hover text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 text-sm md:text-base px-8 py-3 md:px-12 md:py-4 rounded-full font-semibold backdrop-blur-lg"
            >
              <Link href="/products" className="flex items-center gap-3">
                <span>View All Products</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}


