'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewArrival } from '@/components/common/newArrival';
import { Sale } from '@/components/common/sale';
import { 
  heroSlides, 
  testimonials 
} from '@/store/datahome';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000); // 3 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Logged in user:', user);
    } else {
      console.log('No user logged in');
    }
  }, [user, isAuthenticated]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="flex flex-col">      
      {/* Hero Carousel Section */}
      <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="relative w-full h-full flex-shrink-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center text-center p-4 z-10">
                <div className="max-w-4xl mx-auto text-white">
                  <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl mb-8 animate-fade-in-up delay-200">
                    {slide.subtitle}
                  </p>
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 animate-fade-in-up delay-400 text-lg px-8 py-3"
                  >
                    <Link href={slide.link}>
                      {slide.cta} <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ 
              width: `${((currentSlide + 1) / heroSlides.length) * 100}%` 
            }}
          />
        </div>
      </section>

      {/* New Arrivals - Using API Component */}
      <NewArrival limit={4} showViewAll={true} />

      {/* Limited Time Sale - Using API Component */}
      <Sale limit={4} showViewAll={true} title="Limited Time Sale!" />

      {/* Customer Testimonials */}
      <section className="bg-gradient-to-br from-secondary/20 to-secondary/40 py-16 md:py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-16 h-16 border-2 border-primary rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-primary rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-primary rounded-full animate-bounce delay-300"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-primary">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real stories from real customers who love shopping with Bloomtales Boutique
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-background/80 backdrop-blur-sm border-2 hover:border-primary/30 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 relative z-10">
                  {/* Quote icon */}
                  <div className="flex justify-between items-start mb-4">
                    <Quote className="h-8 w-8 text-primary/30 group-hover:text-primary/60 transition-colors duration-300" />
                    <div className="flex">
                      {[...Array(5)].map((_, s) => (
                        <Star 
                          key={s} 
                          className={`h-4 w-4 transition-all duration-300 delay-${s * 50} ${
                            s < testimonial.rating 
                              ? 'text-yellow-400 fill-current group-hover:scale-110' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Review text */}
                  <p className="text-muted-foreground mb-4 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    "{testimonial.review}"
                  </p>
                  
                  {/* Customer info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {testimonial.avatar && (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-bold font-headline text-primary group-hover:text-primary/80 transition-colors duration-300">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Purchased:</p>
                        <p className="text-xs font-medium text-primary/70">{testimonial.purchase}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Join thousands of happy customers</p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/shop">Start Shopping Today</Link>
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
          }
          
          .delay-200 {
            animation-delay: 0.2s;
          }
          
          .delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </section>

    </div>
  );
}