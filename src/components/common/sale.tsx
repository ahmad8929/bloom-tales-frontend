'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Flame, ArrowRight, Sparkles, Heart } from 'lucide-react';
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
  title?: string;
  showViewAll?: boolean;
}

export function Sale({ limit = 8, title = "🔥 Limited Time Sale!", showViewAll = true }: SaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  // Responsive visible cards
  const [visibleCards, setVisibleCards] = useState(4);
  
  const autoScrollDelay = 4000; // ms

  useEffect(() => {
    fetchSaleProducts();
  }, [limit]);

  // Handle responsive visible cards
  useLayoutEffect(() => {
    function updateVisibleCards() {
      const width = window.innerWidth;
      if (width < 640) setVisibleCards(1);      // mobile
      else if (width < 768) setVisibleCards(2); // tablet
      else if (width < 1024) setVisibleCards(3); // small desktop
      else setVisibleCards(4);                   // large desktop
    }

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (products.length > visibleCards && isAutoScrolling) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, products.length - visibleCards);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, autoScrollDelay);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [products.length, visibleCards, isAutoScrolling]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching sale products...');
      const response = await productApi.getSaleProducts(limit);
      console.log('Sale products API response:', response);
      
      let productsList: Product[] = [];
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Check for nested data structure
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const nestedData = (response.data as any).data;
        if (nestedData && typeof nestedData === 'object' && 'products' in nestedData) {
          productsList = nestedData.products || [];
        }
      } 
      else if (response.data && Array.isArray((response.data as any))) {
        productsList = response.data as any;
      }
      else if (response.data && typeof response.data === 'object' && 'products' in (response.data as any)) {
        productsList = (response.data as any).products || [];
      }
      
      console.log('Processed sale products:', productsList);
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

  const handlePrevious = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    const maxIndex = Math.max(0, products.length - visibleCards);
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
    // Resume auto-scroll after 3 seconds
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const handleNext = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    const maxIndex = Math.max(0, products.length - visibleCards);
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
    // Resume auto-scroll after 3 seconds
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const handleIndicatorClick = (index: number) => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoScrolling(true), 3000);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const calculateDiscount = (price: number, comparePrice: number) =>
    Math.round(((comparePrice - price) / comparePrice) * 100);

  const calculateSavings = (price: number, comparePrice: number) =>
    comparePrice - price;

  // UI states
  if (loading) {
    return (
      <section className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 py-16 md:py-24 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-300 rounded-full animate-bounce"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Flame className="w-5 h-5 animate-pulse" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-2 text-muted-foreground">Loading sale products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-300 rounded-full animate-bounce"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Flame className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-lg text-muted-foreground py-12">No sale items available at the moment.</p>
          <p className="text-sm text-muted-foreground">Check back soon for amazing deals!</p>
        </div>
      </section>
    );
  }

  const maxIndex = Math.max(0, products.length - visibleCards);

  return (
    <section className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 py-16 md:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-pink-400 rounded-full animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Flame className="w-5 h-5 animate-pulse" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Don't miss out on these incredible deals! Limited time offers on selected items.
          </p>
          
          {/* Progress indicator for mobile */}
          {products.length > visibleCards && (
            <div className="max-w-md mx-auto mb-4 block md:hidden">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Showing {currentIndex + 1}-{Math.min(currentIndex + visibleCards, products.length)} of {products.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {showViewAll && (
            <div className="mt-6 md:absolute md:top-0 md:right-0 md:mt-0">
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/products?isSale=true" className="flex items-center gap-2">
                  View All Sale <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Navigation controls */}
          {products.length > visibleCards && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 border border-purple-200"
                style={{ marginLeft: '-20px' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 border border-purple-200"
                style={{ marginRight: '-20px' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Products Container */}
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-4 md:gap-6"
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
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-200 bg-white/80 backdrop-blur-sm h-full">
                    <div className="relative h-48 md:h-56">
                      <Image
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm rounded-full font-bold shadow-lg animate-pulse">
                        SALE
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs rounded-full font-bold shadow-lg">
                          {calculateDiscount(product.price, product.comparePrice)}% OFF
                        </div>
                      )}
                      {/* Heart icon for favorites */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg">
                          <Heart className="w-4 h-4 text-purple-500 hover:text-pink-500 transition-colors" />
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-4 bg-gradient-to-br from-white to-purple-50/30">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800 min-h-[3rem] leading-tight">
                        {product.name}
                      </h3>

                      <div className="mb-3 text-sm text-gray-600">
                        <p>Size: <span className="font-medium">{product.size}</span></p>
                        <p>Material: <span className="font-medium capitalize">{product.material}</span></p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-lg text-purple-600">{formatPrice(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>

                      {/* Savings badge */}
                      <div className="mb-3 min-h-[1.5rem] flex justify-center">
                        {product.comparePrice && product.comparePrice > product.price ? (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full shadow-sm">
                            Save {formatPrice(calculateSavings(product.price, product.comparePrice))}!
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full shadow-sm">
                            Special Price
                          </span>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                      >
                        <Link href={`/products/${product._id}`} className="flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          View Details
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