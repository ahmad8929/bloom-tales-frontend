"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { productApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function Sale({
  limit = 8,
  title = "Limited Time Sale",
  showViewAll = true,
  autoPlay = true,
  autoPlayInterval = 4000,
}: SaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1); // Start from first real slide
  const [visibleCards, setVisibleCards] = useState(4);
  const [hasMounted, setHasMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Create multiple copies for seamless infinite scroll
  const slides =
    products.length > 0 ? [...products, ...products, ...products] : [];

  useEffect(() => {
    setHasMounted(true);
    fetchSaleProducts();
  }, [limit]);

  // Handle responsive visible cards
  useLayoutEffect(() => {
    function updateVisibleCards() {
      const width = window.innerWidth;
      if (width < 640) setVisibleCards(1); // mobile
      else if (width < 768) setVisibleCards(2); // tablet
      else if (width < 1024) setVisibleCards(3); // small desktop
      else setVisibleCards(4); // large desktop
    }

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  // Set initial position to middle set when products change
  useEffect(() => {
    if (products.length > 0) {
      setCurrentIndex(products.length); // Start from second set (middle)
      setIsTransitioning(false);
    }
  }, [products.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPlaying || !hasMounted || products.length <= visibleCards) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, hasMounted, products.length, visibleCards]);

  // Handle infinite loop reset when reaching end
  useEffect(() => {
    if (!isTransitioning || slides.length === 0) return;

    const handle = setTimeout(() => {
      // When we reach the end of second set, jump back to start of second set
      if (currentIndex >= products.length * 2) {
        setIsTransitioning(false);
        setCurrentIndex(products.length); // Jump back to start of middle set
      }
      // When we go before first set, jump to end of second set
      if (currentIndex < products.length) {
        setIsTransitioning(false);
        setCurrentIndex(products.length * 2 - 1);
      }
    }, 500); // Match transition duration

    return () => clearTimeout(handle);
  }, [currentIndex, products.length, isTransitioning]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);

      const response = await productApi.getSaleProducts(limit);

      let productsList: Product[] = [];

      if (response.error) {
        throw new Error(response.error);
      }

      // Check for nested data structure
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        const nestedData = (response.data as any).data;
        if (
          nestedData &&
          typeof nestedData === "object" &&
          "products" in nestedData
        ) {
          productsList = nestedData.products || [];
        }
      } else if (response.data && Array.isArray(response.data as any)) {
        productsList = response.data as any;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "products" in (response.data as any)
      ) {
        productsList = (response.data as any).products || [];
      }

      setProducts(productsList);
    } catch (error: any) {
      console.error("Error fetching sale products:", error);
      toast({
        title: "Error",
        description: "Failed to load sale products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev - 1);
    setIsTransitioning(true);
  };

  const goToSlide = (index: number) => {
    // Calculate position in middle set
    setCurrentIndex(products.length + index);
    setIsTransitioning(true);
    setIsPlaying(false);
    // Resume auto-play after 3 seconds
    setTimeout(() => setIsPlaying(true), 3000);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Minimum distance for swipe
    
    if (distance > minSwipeDistance) {
      // Swipe left - next slide
      nextSlide();
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 3000);
    } else if (distance < -minSwipeDistance) {
      // Swipe right - previous slide
      prevSlide();
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 3000);
    }
    
    // Reset
    setTouchStart(0);
    setTouchEnd(0);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  const calculateDiscount = (price: number, comparePrice: number) =>
    Math.round(((comparePrice - price) / comparePrice) * 100);

  const calculateSavings = (price: number, comparePrice: number) =>
    comparePrice - price;

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-24 bg-background relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-hover/30 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-primary/25 mb-6">
            <Flame className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground font-medium">
              Loading sale products...
            </span>
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
            <Flame className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2>
          </div>
          <p className="text-lg text-foreground py-12 font-medium">
            No sale items available at the moment.
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for amazing deals!
          </p>
        </div>
      </section>
    );
  }

  if (!hasMounted) return null;

  // Calculate active indicator (show position within single set of products)
  const activeIndex = (currentIndex - products.length) % products.length;

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
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-primary/25 mb-6 md:mb-8 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 backdrop-blur-lg">
            <Flame className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground">
              {title}
            </h2>
          </div>
          <p className="text-foreground text-sm md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-medium mb-6">
            Don't miss out on these incredible deals! Limited time offers on
            selected items.
          </p>
        </div>

        {/* Products Carousel */}
        <div className="relative group">
          {/* Navigation Buttons */}
          {products.length > visibleCards && (
            <>
              <button
                onClick={() => {
                  prevSlide();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 3000);
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 hover:bg-card active:bg-card text-primary p-2 md:p-3 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 hover:scale-110 transition-all duration-300 -translate-x-1 md:-translate-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => {
                  nextSlide();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 3000);
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/90 hover:bg-card active:bg-card text-primary p-2 md:p-3 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 hover:scale-110 transition-all duration-300 translate-x-1 md:translate-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Products Container */}
          <div 
            ref={carouselRef}
            className="overflow-hidden mx-2 md:mx-4 lg:mx-8 touch-pan-x"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out gap-3 md:gap-4 lg:gap-6"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / visibleCards
                }%)`,
                transition: isTransitioning
                  ? "transform 0.5s ease-in-out"
                  : "none",
              }}
            >
              {slides.map((product, index) => (
                <div
                  key={`${product._id}-${index}`}
                  className="group flex-shrink-0"
                  style={{
                    width: `calc(${100 / visibleCards}% - ${visibleCards > 1 ? (12 * (visibleCards - 1)) / visibleCards : 0}px)`,
                    minWidth: visibleCards === 1 ? '100%' : 'auto'
                  }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm h-full">
                    <div className="relative h-48 md:h-56 lg:h-64">
                      <Image
                        src={
                          product.images?.[0]?.url || "/placeholder-product.jpg"
                        }
                        alt={product.images?.[0]?.alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Sale Badge */}
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs md:text-sm rounded-full font-bold shadow-lg animate-pulse">
                        SALE
                      </div>

                      {/* Discount Badge */}
                      {product.comparePrice &&
                        product.comparePrice > product.price && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs rounded-full font-bold shadow-lg">
                            {calculateDiscount(
                              product.price,
                              product.comparePrice
                            )}
                            % OFF
                          </div>
                        )}

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardContent className="p-4 md:p-6 bg-card">
                      <h3 className="font-semibold mb-3 line-clamp-2 text-foreground min-h-[3rem] leading-tight text-sm md:text-base">
                        {product.name}
                      </h3>

                      <div className="mb-3 text-xs md:text-sm text-muted-foreground">
                        <p>
                          Size:{" "}
                          <span className="font-medium">{product.size}</span>
                        </p>
                        <p>
                          Material:{" "}
                          <span className="font-medium capitalize">
                            {product.material}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-lg md:text-xl text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                      </div>

                      {/* Savings Badge */}
                      <div className="mb-4 min-h-[1.5rem] flex justify-center">
                        {product.comparePrice &&
                        product.comparePrice > product.price ? (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full shadow-sm">
                            Save{" "}
                            {formatPrice(
                              calculateSavings(
                                product.price,
                                product.comparePrice
                              )
                            )}
                            !
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-primary bg-primary/20 px-3 py-1 rounded-full shadow-sm">
                            Special Price
                          </span>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:scale-105 rounded-full"
                      >
                        <Link
                          href={`/products/${product._id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm md:text-base">
                            View Details
                          </span>
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          {/* {products.length > visibleCards && (
            <div className="flex justify-center mt-8 md:mt-12 gap-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-primary scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
  )} */}
          {showViewAll && (
            <div className="flex justify-center mt-8">
              <Button
                asChild
                className="bg-primary hover:bg-hover text-primary-foreground border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 text-sm md:text-base px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold backdrop-blur-lg"
              >
                <Link
                  href="/products?isSale=true"
                  className="flex items-center gap-2"
                >
                  View All Sale <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 640px) {
          .touch-pan-x {
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
          }
        }
      `}</style>
    </section>
  );
}
