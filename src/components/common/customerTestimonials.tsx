'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  autoPlay?: boolean;
  autoPlayInterval?: number;
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
  autoPlay = true,
  autoPlayInterval = 5000,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  className = ""
}: CustomerTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start from first real slide
  const [visibleCards, setVisibleCards] = useState(3);
  const [hasMounted, setHasMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Create multiple copies for seamless infinite scroll
  const slides = testimonials.length > 0 ? [...testimonials, ...testimonials, ...testimonials] : [];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle responsive visible cards
  useLayoutEffect(() => {
    function updateVisibleCards() {
      const width = window.innerWidth;
      if (width < 768) setVisibleCards(itemsPerView.mobile);      // mobile
      else if (width < 1024) setVisibleCards(itemsPerView.tablet); // tablet
      else setVisibleCards(itemsPerView.desktop);                  // desktop
    }

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, [itemsPerView]);

  // Set initial position to middle set when testimonials change
  useEffect(() => {
    if (testimonials.length > 0) {
      setCurrentIndex(testimonials.length); // Start from second set (middle)
      setIsTransitioning(false);
    }
  }, [testimonials.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPlaying || !hasMounted || testimonials.length <= visibleCards) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(true);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, hasMounted, testimonials.length, visibleCards]);

  // Handle infinite loop reset when reaching end
  useEffect(() => {
    if (!isTransitioning || slides.length === 0) return;

    const handle = setTimeout(() => {
      // When we reach the end of second set, jump back to start of second set
      if (currentIndex >= testimonials.length * 2) {
        setIsTransitioning(false);
        setCurrentIndex(testimonials.length); // Jump back to start of middle set
      }
      // When we go before first set, jump to end of second set
      if (currentIndex < testimonials.length) {
        setIsTransitioning(false);
        setCurrentIndex(testimonials.length * 2 - 1);
      }
    }, 500); // Match transition duration

    return () => clearTimeout(handle);
  }, [currentIndex, testimonials.length, isTransitioning]);

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
    setCurrentIndex(testimonials.length + index);
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

  if (!hasMounted) return null;

  // Calculate active indicator (show position within single set of testimonials)
  const activeIndex = (currentIndex - testimonials.length) % testimonials.length;

  return (
    <section className={`py-12 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white relative overflow-hidden ${className}`}>
      {/* Background decorative elements */}
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
            <Users className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Customer Love
            </h2>
          </div>
          <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-purple-800 leading-tight">
            {title}
          </h3>
          <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>
        
        {/* Testimonials Carousel */}
        <div className="relative group">
          {/* Navigation Buttons */}
          {testimonials.length > visibleCards && (
            <>
              <button
                onClick={() => {
                  prevSlide();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 3000);
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white active:bg-white text-purple-600 p-2 md:p-3 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 hover:scale-110 transition-all duration-300 -translate-x-1 md:-translate-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
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
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white active:bg-white text-purple-600 p-2 md:p-3 rounded-full shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 hover:scale-110 transition-all duration-300 translate-x-1 md:translate-x-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Testimonials Container */}
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
                transform: `translateX(-${(currentIndex * 100) / visibleCards}%)`,
                transition: isTransitioning ? "transform 0.5s ease-in-out" : "none"
              }}
            >
              {slides.map((testimonial, index) => (
                <div 
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0"
                  style={{ 
                    width: `calc(${100 / visibleCards}% - ${visibleCards > 1 ? (12 * (visibleCards - 1)) / visibleCards : 0}px)`,
                    minWidth: visibleCards === 1 ? '100%' : 'auto'
                  }}
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
                      <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 flex-grow line-clamp-4 md:line-clamp-5">
                        "{testimonial.review}"
                      </p>
                      
                      {/* Footer with Customer Info */}
                      <div className="border-t border-purple-100 pt-4 mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {testimonial.avatar ? (
                              <Image
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover w-8 h-8 md:w-10 md:h-10 border-2 border-purple-200 group-hover:border-purple-300 transition-colors duration-300"
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-lg">
                                {testimonial.name[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-purple-700 group-hover:text-purple-600 transition-colors duration-300 text-sm md:text-base truncate">
                                {testimonial.name}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 truncate">{testimonial.location}</p>
                            </div>
                          </div>
                          <div className="text-right min-w-0 flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-400">Purchased:</p>
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
          {testimonials.length > visibleCards && (
            <div className="flex justify-center mt-8 md:mt-12 gap-2">
              {testimonials.map((_, index) => (
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
          )}
        </div>
        
        {/* CTA Section */}
        {showCTA && (
          <div className="text-center mt-12 md:mt-16">
            <div className="inline-flex items-center gap-2 text-gray-600 mb-4 md:mb-6">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
              <span className="text-sm md:text-base font-medium">Join thousands of happy customers</span>
            </div>
            <br />
            <Button 
              asChild 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 text-sm md:text-base px-8 py-3 md:px-12 md:py-4 rounded-full font-semibold backdrop-blur-lg"
            >
              <Link href={ctaLink} className="flex items-center gap-2">
                <span>{ctaText}</span>
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-5 {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
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