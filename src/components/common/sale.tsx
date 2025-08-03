'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2, Timer } from 'lucide-react';
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

interface SaleProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
}

export function Sale({ limit = 4, showViewAll = true, title = "Limited Time Sale!" }: SaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleProducts();
  }, [limit]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getSaleProducts(limit);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const productsList = response.data?.data?.products || [];
      setProducts(productsList);
    } catch (error: any) {
      console.error('Error fetching sale products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sale products',
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

  const calculateSavings = (price: number, comparePrice: number) => {
    return comparePrice - price;
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-red-50 to-orange-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Timer className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                {title}
              </h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="ml-2 text-muted-foreground">Loading sale products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-red-50 to-orange-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Timer className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">
                {title}
              </h2>
            </div>
          </div>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No sale items available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for amazing deals!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-red-50 to-orange-50 py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300 rounded-full animate-pulse delay-100"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4 animate-pulse">
            <Timer className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">
              {title}
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't miss out on these incredible deals! Limited time offers on selected items.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id || product.id} className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-red-200">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                    alt={product.images?.[0]?.alt || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Sale Badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 text-sm rounded-full font-bold shadow-lg animate-pulse">
                    SALE
                  </div>
                  
                  {/* Discount Percentage */}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs rounded-full font-bold">
                      {calculateDiscount(product.price, product.comparePrice)}% OFF
                    </div>
                  )}
                  
                  {/* Savings Amount */}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded font-medium">
                      Save {formatPrice(calculateSavings(product.price, product.comparePrice))}
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 bg-gradient-to-br from-white to-red-50">
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] text-gray-800">
                    {product.name}
                  </h3>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Size: {product.size}</p>
                    <p className="text-sm text-gray-600">Material: {product.material}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-xl text-red-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-center mb-3">
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        You save {formatPrice(calculateSavings(product.price, product.comparePrice))}!
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    className="w-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                     <Link href={`/products/${product._id}`}>
                      Buy Now - Limited Time!
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {showViewAll && (
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl px-8 py-3">
              <Link href="/products?isSale=true">
                View All Sale Items
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}