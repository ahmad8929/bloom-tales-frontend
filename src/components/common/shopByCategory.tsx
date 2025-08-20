'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Package } from 'lucide-react';
import { categories } from '@/dummyData';

interface ShopByCategoryProps {
  showViewAll?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  title?: string;
  subtitle?: string;
  showDescription?: boolean;
  showItemCount?: boolean;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export function ShopByCategory({ 
  showViewAll = true, 
  autoScroll = true,
  autoScrollInterval = 3500,
  title = "Shop by Category",
  subtitle = "Explore our curated collections designed for every occasion and style preference",
  showDescription = true,
  showItemCount = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 },
  className = ""
}: ShopByCategoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const autoScrollRef = useRef<NodeJS.Timeout>();

  // Detect viewport size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportSize('mobile');
      } else if (width < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleCards = itemsPerView[viewportSize];
  const maxIndex = Math.max(0, categories.length - visibleCards);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && categories.length > visibleCards) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }, autoScrollInterval);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [autoScroll, maxIndex, autoScrollInterval, visibleCards]);

  const handlePrevious = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const handleNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const goToIndex = (index: number) => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(index);
  };

  return (
    <section className={`py-12 md:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden ${className}`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 md:top-20 left-4 md:left-10 w-16 md:w-24 h-16 md:h-24 border-2 border-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-12 md:w-16 h-12 md:h-16 border-2 border-gray-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 md:w-12 h-8 md:h-12 border-2 border-gray-400 rounded-full animate-pulse delay-100"></div>
        <div className="absolute top-1/3 right-1/3 w-6 md:w-10 h-6 md:h-10 border-2 border-gray-300 rounded-full animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            <h2 className="font-headline text-xl md:text-2xl lg:text-3xl font-bold">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Categories Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {categories.length > visibleCards && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 -translate-x-2 md:-translate-x-4"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 translate-x-2 md:translate-x-4"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Categories Container */}
          <div className="overflow-hidden mx-2 md:mx-4 lg:mx-8">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-3 md:gap-4 lg:gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                width: `${(categories.length / visibleCards) * 100}%`
              }}
            >
              {categories.map((category, index) => (
                <div 
                  key={category.id} 
                  className="group flex-shrink-0"
                  style={{ width: `${100 / categories.length}%` }}
                >
                  <Link href={`/category/${category.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-gray-300 h-full bg-white/80 backdrop-blur-sm">
                      <div className="aspect-square relative">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300"></div>
                        
                        {/* Category Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                          <h3 className="font-bold text-base md:text-lg lg:text-xl mb-1 group-hover:text-yellow-300 transition-colors duration-300 line-clamp-1">
                            {category.name}
                          </h3>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Shop Now Button - Appears on Hover */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <Button 
                            size="sm" 
                            className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-xs md:text-sm px-3 md:px-4 py-1 md:py-2"
                          >
                            <span className="hidden sm:inline">Shop Now</span>
                            <span className="sm:hidden">Shop</span>
                            <ArrowRight className="ml-1 w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>

                        {/* Mobile Touch Indicator */}
                        <div className="absolute top-2 right-2 md:hidden bg-black/50 text-white p-1 rounded-full text-xs">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          {categories.length > visibleCards && (
            <div className="flex justify-center mt-6 md:mt-8 gap-1 md:gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gray-700 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {showViewAll && (
          <div className="text-center mt-8 md:mt-12">
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-300 hover:scale-105 text-sm md:text-base px-6 md:px-8 py-2 md:py-3"
            >
              <Link href="/categories">
                View All Categories
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
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