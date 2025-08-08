'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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

export function NewArrival({ limit = 8, showViewAll = true }: NewArrivalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  const visibleCards = 4; // Number of cards visible at once
  const maxIndex = Math.max(0, products.length - visibleCards);

  useEffect(() => {
    fetchNewArrivals();
  }, [limit]);

  // Auto-scroll functionality with progress tracking
  useEffect(() => {
    if (products.length > visibleCards && isAutoScrolling) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }, 3000);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [products.length, maxIndex, isAutoScrolling]);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const response = await productApi.getNewArrivals(limit);
      
      if (response.error) {
        throw new Error(response.error);
      }
      const productsList = response.data?.data?.products || [];
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

  const handlePrevious = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const handleNext = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const handleIndicatorClick = (index: number) => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">New Arrivals</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-muted-foreground">Loading new arrivals...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-headline text-2xl md:text-3xl font-bold">New Arrivals</h2>
            </div>
          </div>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No new arrivals available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for our latest collections!</p>
          </div>
        </div>
      </section>
    );
  }

  const progressPercentage = products.length > visibleCards 
    ? ((currentIndex + 1) / (maxIndex + 1)) * 100 
    : 100;

  return (
    <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-16 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300 rounded-full animate-pulse delay-100"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">New Arrivals</h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our latest collection of stunning pieces, fresh from our designers
          </p>
          
          {/* Progress Bar */}
          {products.length > visibleCards && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Showing {currentIndex + 1}-{Math.min(currentIndex + visibleCards, products.length)} of {products.length}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
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
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-sm rounded-full font-bold shadow-lg animate-pulse">
                        NEW
                      </div>
                      {product.isSale && product.comparePrice && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-bold">
                          {calculateDiscount(product.price, product.comparePrice)}% OFF
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 bg-gradient-to-br from-white to-blue-50/30">
                      <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] text-gray-800">
                        {product.name}
                      </h3>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Size: {product.size}</p>
                        <p className="text-sm text-gray-600">Material: {product.material}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-lg text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Link href={`/products/${product._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          {products.length > visibleCards && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-blue-200 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Auto-scroll control */}
          {products.length > visibleCards && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
                  isAutoScrolling 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isAutoScrolling ? '⏸️ Pause Auto-scroll' : '▶️ Resume Auto-scroll'}
              </button>
            </div>
          )}
        </div>
        
        {showViewAll && (
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl px-8 py-3">
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