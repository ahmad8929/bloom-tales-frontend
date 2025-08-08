'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { categories } from '@/dummyData';

interface ShopByCategoryProps {
  showViewAll?: boolean;
  autoScroll?: boolean;
  title?: string;
}

export function ShopByCategory({ 
  showViewAll = true, 
  autoScroll = true,
  title = "Shop by Category"
}: ShopByCategoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  const visibleCards = 4; // Show 4 categories at once on desktop
  const maxIndex = Math.max(0, categories.length - visibleCards);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && categories.length > visibleCards) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }, 3500);

      return () => {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
        }
      };
    }
  }, [autoScroll, maxIndex]);

  const handlePrevious = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const handleNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-24 h-24 border-2 border-gray-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-gray-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-gray-400 rounded-full animate-pulse delay-100"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-lg shadow-lg mb-4">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-headline text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated collections designed for every occasion and style preference
          </p>
        </div>
        
        {/* Categories Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {categories.length > visibleCards && (
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

          {/* Categories Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
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
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-gray-300">
                      <div className="aspect-square relative">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                        
                        {/* Category Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                            {category.name}
                          </h3>
                          <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                            {category.description}
                          </p>
                          {category.itemCount && (
                            <div className="mt-2">
                              <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                {category.itemCount} items
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Shop Now Button - Appears on Hover */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <Button 
                            size="sm" 
                            className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                          >
                            Shop Now
                          </Button>
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
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-gray-700 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {showViewAll && (
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg hover:shadow-xl px-8 py-3">
              <Link href="/products">
                Explore All Categories
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}