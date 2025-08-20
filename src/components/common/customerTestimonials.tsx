'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight, Users, Heart } from 'lucide-react';
import { testimonials } from '@/dummyData';

interface CustomerTestimonialsProps {
  title?: string;
  subtitle?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaLink?: string;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
}

export function CustomerTestimonials({
  title = "What Our Customers Say",
  subtitle = "Real stories from real customers who love shopping with Bloomtales Boutique",
  showCTA = true,
  ctaText = "Start Shopping Today",
  ctaLink = "/products",
  autoScroll = true,
  autoScrollInterval = 5000,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  className = ""
}: CustomerTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);
  const autoScrollRef = useRef<NodeJS.Timeout>();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

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

  const visibleItems = itemsPerView[viewportSize];
  const maxIndex = Math.max(0, testimonials.length - visibleItems);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling && testimonials.length > visibleItems) {
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
  }, [isAutoScrolling, maxIndex, autoScrollInterval, visibleItems]);

  const handlePrevious = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setIsAutoScrolling(false);
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const handleNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setIsAutoScrolling(false);
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const goToIndex = (index: number) => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setIsAutoScrolling(false);
    setCurrentIndex(index);
  };

  return (
    <section className={`bg-gradient-to-br from-purple-50 to-pink-50 py-12 md:py-16 lg:py-24 relative overflow-hidden ${className}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-16 md:w-20 h-16 md:h-20 border-2 border-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-10 md:right-20 w-12 md:w-16 h-12 md:h-16 border-2 border-pink-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-20 left-1/4 w-8 md:w-12 h-8 md:h-12 border-2 border-purple-400 rounded-full animate-pulse delay-200"></div>
        <div className="absolute top-1/2 right-1/3 w-6 md:w-10 h-6 md:h-10 border-2 border-pink-300 rounded-full animate-bounce delay-300"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg mb-4 md:mb-6">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-semibold text-sm md:text-base">Customer Love</span>
          </div>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-purple-800 leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {testimonials.length > visibleItems && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 -translate-x-4 md:-translate-x-6"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 translate-x-4 md:translate-x-6"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </>
          )}

          {/* Testimonials Container */}
          <div className="overflow-hidden mx-4 md:mx-8">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-4 md:gap-6 lg:gap-8"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                width: `${(testimonials.length / visibleItems) * 100}%`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="flex-shrink-0"
                  style={{ width: `${100 / testimonials.length}%` }}
                >
                  <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-2 hover:border-purple-200 relative overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="p-4 md:p-6 relative z-10 flex flex-col h-full">
                      {/* Header with Quote and Rating */}
                      <div className="flex justify-between items-start mb-4">
                        <Quote className="h-6 w-6 md:h-8 md:w-8 text-purple-300 group-hover:text-purple-500 transition-colors duration-300 flex-shrink-0" />
                        <div className="flex">
                          {[...Array(5)].map((_, s) => (
                            <Star 
                              key={s} 
                              className={`h-3 w-3 md:h-4 md:w-4 transition-all duration-300 ${
                                s < testimonial.rating 
                                  ? 'text-yellow-400 fill-current group-hover:scale-110' 
                                  : 'text-gray-300'
                              }`}
                              style={{ transitionDelay: `${s * 50}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Review Text */}
                      <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 flex-grow line-clamp-4 md:line-clamp-none">
                        "{testimonial.review}"
                      </p>
                      
                      {/* Footer with Customer Info */}
                      <div className="border-t pt-4 mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {testimonial.avatar ? (
                              <Image
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover w-8 h-8 md:w-10 md:h-10"
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm md:text-base">
                                {testimonial.name[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-purple-700 group-hover:text-purple-600 transition-colors duration-300 text-sm md:text-base truncate">
                                {testimonial.name}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">{testimonial.location}</p>
                            </div>
                          </div>
                          <div className="text-right min-w-0 flex-shrink-0 ml-2">
                            <p className="text-xs text-muted-foreground">Purchased:</p>
                            <p className="text-xs font-medium text-purple-600 line-clamp-2">{testimonial.purchase}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicators */}
          {testimonials.length > visibleItems && (
            <div className="flex justify-center mt-6 md:mt-8 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-purple-600 scale-125' 
                      : 'bg-purple-300 hover:bg-purple-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* CTA Section */}
        {showCTA && (
          <div className="text-center mt-12 md:mt-16">
            <div className="inline-flex items-center gap-2 text-muted-foreground mb-4 md:mb-6">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
              <span className="text-sm md:text-base">Join thousands of happy customers</span>
            </div>
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base px-6 md:px-8 py-2 md:py-3"
            >
              <Link href={ctaLink}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (min-width: 768px) {
          .md\\:line-clamp-none {
            display: block;
            -webkit-line-clamp: unset;
            -webkit-box-orient: unset;
            overflow: visible;
          }
        }
      `}</style>
    </section>
  );
}