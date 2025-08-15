'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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

interface SaleProps {
  limit?: number;
  title?: string;
  showViewAll?: boolean; // Added this prop
}

export function Sale({ limit = 8, title = "🔥 Limited Time Sale!", showViewAll = true }: SaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null); // visible viewport
  const trackRef = useRef<HTMLDivElement | null>(null); // flex track
  const autoScrollRef = useRef<number | null>(null);

  // measured sizes
  const [cardWidth, setCardWidth] = useState<number>(0);
  const [gapPx, setGapPx] = useState<number>(24); // tailwind gap-6 default fallback

  const visibleCards = 4;
  const autoScrollDelay = 3500; // ms
  const transitionDuration = 500; // ms

  useEffect(() => {
    fetchSaleProducts();
  }, [limit]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching sale products...');
      const response = await productApi.getSaleProducts(limit);
      console.log('Sale products API response:', response);
      
      // Handle different response structures (same pattern as products/customers page)
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
      // Check for direct products array in response.data
      else if (response.data && Array.isArray((response.data as any))) {
        productsList = response.data as any;
      }
      // Check if products are directly in response.data
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

  // measure container & gap to compute exact card width (px)
  useLayoutEffect(() => {
    function updateSizes() {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const containerWidth = container.clientWidth;
      // read computed gap (e.g. "24px") from CSS; fallback to 24
      const computedGap = parseFloat(getComputedStyle(track).gap || '24') || 24;
      setGapPx(computedGap);

      // compute card width so visibleCards fit exactly (accounting for gaps)
      const newCardWidth = Math.floor((containerWidth - computedGap * (visibleCards - 1)) / visibleCards);
      if (newCardWidth > 0) setCardWidth(newCardWidth);
    }

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [visibleCards, products.length]);

  // helper: start auto scroll
  const startAutoScroll = () => {
    if (autoScrollRef.current) {
      window.clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    if (products.length <= visibleCards || cardWidth === 0) return;

    autoScrollRef.current = window.setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, products.length - visibleCards);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoScrollDelay);
  };

  // auto-start when sizes/products ready
  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        window.clearInterval(autoScrollRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, cardWidth]);

  // update transform when index changes
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const moveX = currentIndex * (cardWidth + gapPx);
    track.style.transition = `transform ${transitionDuration}ms ease`;
    track.style.transform = `translateX(-${moveX}px)`;
  }, [currentIndex, cardWidth, gapPx]);

  // navigation handlers
  const handlePrevious = () => {
    if (autoScrollRef.current) {
      window.clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    const maxIndex = Math.max(0, products.length - visibleCards);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    // restart auto-scroll after interaction
    setTimeout(startAutoScroll, 2000);
  };

  const handleNext = () => {
    if (autoScrollRef.current) {
      window.clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    const maxIndex = Math.max(0, products.length - visibleCards);
    setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    setTimeout(startAutoScroll, 2000);
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
      <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Flame className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
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
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
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
    <section className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 py-8 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg mb-4 animate-pulse">
            <Flame className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't miss out on these incredible deals! Limited time offers on selected items.
          </p>
          {/* Conditionally render View All button based on showViewAll prop */}
          {showViewAll && (
            <div className="absolute top-0 right-0">
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/products?isSale=true" className="flex items-center gap-2">
                  View All Sale <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="relative">
          {/* Nav controls */}
          {products.length > visibleCards && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* viewport */}
          <div ref={containerRef} className="overflow-hidden rounded-lg">
            {/* track - we set transform in px */}
            <div
              ref={trackRef}
              className={`flex ${products.length <= visibleCards ? 'justify-center' : ''} gap-6`}
              style={{
                // ensure the track is wide enough so flex children don't wrap or collapse (optional but safe)
                width: cardWidth > 0 ? `${products.length * (cardWidth + gapPx) - gapPx}px` : undefined,
              }}
            >
              {products.map(product => (
                <div
                  key={product._id || product.id}
                  className="group flex-shrink-0"
                  style={{ width: cardWidth || undefined }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200 h-fit">
                    {/* fixed image height for consistent shorter cards */}
                    <div className="relative h-40 md:h-44">
                      <Image
                        src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                        alt={product.images?.[0]?.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 text-sm rounded-full font-bold shadow-lg animate-pulse">
                        SALE
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-bold">
                          {calculateDiscount(product.price, product.comparePrice)}% OFF
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3 bg-gradient-to-br from-white to-blue-50/30">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-sm text-gray-800 min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <div className="mb-2 text-xs text-gray-600">
                        Size: {product.size} | Material: {product.material}
                      </div>

                      <div className="flex items-center gap-2 mb-2 min-h-[1.25rem]">
                        <span className="font-bold text-base text-blue-600">{formatPrice(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>

                      {/* reserve fixed area for savings so layout doesn't jump */}
                      <div className="min-h-[1.25rem] mb-2 flex justify-center">
                        {product.comparePrice && product.comparePrice > product.price ? (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            Save {formatPrice(calculateSavings(product.price, product.comparePrice))}!
                          </span>
                        ) : null}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-8 text-xs"
                      >
                        <Link href={`/products/${product._id}`}>Buy Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* optional dots / position indicator */}
        {products.length > visibleCards && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (autoScrollRef.current) {
                    window.clearInterval(autoScrollRef.current);
                    autoScrollRef.current = null;
                  }
                  setCurrentIndex(i);
                  setTimeout(startAutoScroll, 2000);
                }}
                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}