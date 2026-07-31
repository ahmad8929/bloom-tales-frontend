'use client';

import { useState, useEffect } from 'react';
import { productApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { cartApi } from '@/lib/api';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/primitives';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';

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
  title = 'The Edit',
  showViewAll = true,
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
      } else if (response.data && Array.isArray(response.data as any)) {
        productsList = (response.data as any).slice(0, limit);
      } else if (response.data && typeof response.data === 'object' && 'products' in (response.data as any)) {
        productsList = ((response.data as any).products || []).slice(0, limit);
      }

      setProducts(productsList);
    } catch (error: any) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionHeader = (
    <FadeIn className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
      <div>
        <p className="eyebrow mb-4">Handpicked for you</p>
        <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
          {title}
        </h2>
      </div>
      {showViewAll && (
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-luxe text-heading transition-colors hover:text-gold"
        >
          View all products
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </FadeIn>
  );

  // Loading state — elegant skeleton grid
  if (loading) {
    return (
      <section className="bg-white py-20 md:py-28">
        <div className="container">
          {sectionHeader}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <section className="bg-white py-20 md:py-28">
        <div className="container text-center">
          <p className="eyebrow mb-4">Handpicked for you</p>
          <h2 className="font-display text-3xl md:text-4xl">The shelves are being dressed</h2>
          <p className="mt-3 text-text-muted">
            New pieces are on their way. Check back soon for our latest collections.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container">
        {sectionHeader}

        <Stagger gap={0.06} className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {products.map((product) => (
            <StaggerItem key={product._id || product.id}>
              <ProductCard product={product} cartItems={cartItems} />
            </StaggerItem>
          ))}
        </Stagger>

        {showViewAll && (
          <FadeIn className="mt-14 text-center md:mt-20">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border border-primary/70 px-10 py-4 font-sans text-[12px] font-semibold uppercase tracking-luxe text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              View All Products
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
