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
      nextSlide();
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
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-purple-500/25 mb-6">
            <Flame className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600 font-medium">
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
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-lg animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-purple-500/25 mb-6">
            <Flame className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="text-lg text-gray-600 py-12 font-medium">
            No sale items available at the moment.
          </p>
          <p className="text-sm text-gray-500">
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
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 md:w-20 h-12 md:h-20 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-md animate-pulse delay-100"></div>
        <div className="absolute top-1/3 right-1/3 w-8 md:w-16 h-8 md:h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-sm animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-purple-500/25 mb-6 md:mb-8 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 backdrop-blur-lg">
            <Flame className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-medium mb-6">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-110 transition-all duration-300 -translate-x-2 md:-translate-x-4 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => {
                  nextSlide();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 3000);
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-110 transition-all duration-300 translate-x-2 md:translate-x-4 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Products Container */}
          <div className="overflow-hidden mx-2 md:mx-4 lg:mx-8">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-4 md:gap-6"
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
                    width: `calc(${100 / visibleCards}% - ${
                      (4 * (visibleCards - 1)) / visibleCards
                    }px)`,
                    marginRight: index < slides.length - 1 ? "1rem" : "0",
                  }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-200 bg-white/80 backdrop-blur-sm h-full">
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
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-xs md:text-sm rounded-full font-bold shadow-lg animate-pulse">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <CardContent className="p-4 md:p-6 bg-gradient-to-br from-white to-purple-50/30">
                      <h3 className="font-semibold mb-3 line-clamp-2 text-gray-800 min-h-[3rem] leading-tight text-sm md:text-base">
                        {product.name}
                      </h3>

                      <div className="mb-3 text-xs md:text-sm text-gray-600">
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
                        <span className="font-bold text-lg md:text-xl text-purple-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
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
                          <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full shadow-sm">
                            Special Price
                          </span>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:scale-105 rounded-full"
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
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-125 shadow-lg' 
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 text-sm md:text-base px-6 py-2 md:px-8 md:py-3 rounded-full font-semibold backdrop-blur-lg"
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
      `}</style>
    </section>
  );
}
