'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Flame, ArrowRight } from 'lucide-react';
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

interface ApiResponse {
  data?: {
    data?: {
      products?: Product[];
    };
  };
  error?: string;
}

interface SaleProps {
  limit?: number;
  title?: string;
}

export function Sale({ limit = 8, title = "🔥 Limited Time Sale!" }: SaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  const visibleCards = 4;

  useEffect(() => {
    fetchSaleProducts();
  }, [limit]);

  // Auto-scroll functionality with seamless loop
  useEffect(() => {
    if (products.length > visibleCards) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = products.length - visibleCards;
          const next = prev + 1;
          // Seamless loop: go back to start when reaching the end
          return next > maxIndex ? 0 : next;
        });
      }, 3500);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [products.length]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      const response: ApiResponse = await productApi.getSaleProducts(limit);
      
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

  const handlePrevious = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    const maxIndex = products.length - visibleCards;
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const handleNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    const maxIndex = products.length - visibleCards;
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Flame className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-muted-foreground">Loading sale products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Flame className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No sale items available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for amazing deals!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-8 md:py-12 relative overflow-hidden">
      {/* Background decorative elements - Same as homepage */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300 rounded-full animate-pulse delay-100"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4 animate-pulse">
            <Flame className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't miss out on these incredible deals! Limited time offers on selected items.
          </p>
          
          {/* View All Sale Button - Top Right */}
          <div className="absolute top-0 right-0">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/products?isSale=true" className="flex items-center gap-2">
                View All Sale
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {products.length > visibleCards && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Products Container */}
          <div 
            ref={scrollRef}
            className="overflow-hidden rounded-lg"
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                width: `${(products.length / visibleCards) * 100}%`
              }}
            >
              {products.map((product, index) => (
                <div 
                  key={product._id || product.id} 
                  className="group flex-shrink-0"
                  style={{ width: `${100 / products.length}%` }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200 h-fit">
                    <div className="aspect-[3/4.5] relative">
                      <Image
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      
                      {/* Sale Badge - Blue theme */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-sm rounded-full font-bold shadow-lg animate-pulse">
                        SALE
                      </div>
                      
                      {/* Discount Percentage */}
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-bold">
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
                    
                    <CardContent className="p-3 bg-gradient-to-br from-white to-blue-50/30">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-sm text-gray-800 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      
                      <div className="mb-2">
                        <p className="text-xs text-gray-600">Size: {product.size}</p>
                        <p className="text-xs text-gray-600">Material: {product.material}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-base text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-center mb-2">
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            Save {formatPrice(calculateSavings(product.price, product.comparePrice))}!
                          </span>
                        </div>
                      )}
                      
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-8 text-xs"
                      >
                        <Link href={`/products/${product._id}`}>
                          Buy Now
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}