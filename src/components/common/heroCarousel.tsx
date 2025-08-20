'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '@/dummyData';

interface HeroCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function HeroCarousel({ 
  autoPlay = true, 
  autoPlayInterval = 4000,
  className = ""
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(1); // start from first real slide
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasMounted, setHasMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Clone slides: [last, ...real, first]
  const slides = [
    heroSlides[heroSlides.length - 1],
    ...heroSlides,
    heroSlides[0],
  ];

  // Mount check
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!isPlaying || !hasMounted) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, hasMounted]);

  const nextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
    setIsTransitioning(true);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
    setIsTransitioning(true);
  };

  // Handle infinite loop (jump without transition)
  useEffect(() => {
    if (!isTransitioning) return;

    const handle = setTimeout(() => {
      if (currentSlide === slides.length - 1) {
        setIsTransitioning(false);
        setCurrentSlide(1); // jump to first real
      }
      if (currentSlide === 0) {
        setIsTransitioning(false);
        setCurrentSlide(slides.length - 2); // jump to last real
      }
    }, 700); // match transition duration

    return () => clearTimeout(handle);
  }, [currentSlide, slides.length, isTransitioning]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index + 1); // offset for clone
    setIsTransitioning(true);
  };

  if (!hasMounted) {
    return (
      <section className={`relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] bg-gray-200 animate-pulse ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden group ${className}`}>
      {/* Slides */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: isTransitioning ? "transform 0.7s ease-in-out" : "none",
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative w-full h-full flex-shrink-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 1} // first real slide
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60"></div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <div className="hidden sm:flex">
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 opacity-70 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 opacity-70 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2 md:space-x-3">
        {heroSlides.map((_, index) => {
          const realIndex = currentSlide - 1;
          const activeIndex =
            realIndex === -1
              ? heroSlides.length - 1
              : realIndex === heroSlides.length
              ? 0
              : realIndex;

          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-linear"
          style={{
            width: `${(((currentSlide - 1 + heroSlides.length) % heroSlides.length) + 1) / heroSlides.length * 100}%`
          }}
        />
      </div>
    </section>
  );
}
