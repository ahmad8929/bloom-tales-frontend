'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { productApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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

interface NewArrivalProps {
  limit?: number;
  showViewAll?: boolean;
}

export function NewArrival({ limit = 4, showViewAll = true }: NewArrivalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, [limit]);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const response = await productApi.getNewArrivals(limit);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const productsList = response.data?.data?.products || response.data?.products || [];
      setProducts(productsList);
    } catch (error: any) {
      console.error('Error fetching new arrivals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load new arrivals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (loading) {
    return (
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            New Arrivals
          </h2>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading new arrivals...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            New Arrivals
          </h2>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No new arrivals available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for our latest collections!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
          New Arrivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id || product.id} className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={product.images?.[0]?.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {product.isNewArrival && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded font-medium">
                      NEW
                    </div>
                  )}
                  {product.isSale && product.comparePrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded font-medium">
                      {calculateDiscount(product.price, product.comparePrice)}% OFF
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                  
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">Size: {product.size}</p>
                    <p className="text-sm text-muted-foreground">Material: {product.material}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full mt-3 bg-primary hover:bg-primary/90"
                  >
                    <Link href={`/products/${product.slug || product._id || product.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {showViewAll && (
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products?isNewArrival=true">
                View All New Arrivals
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}