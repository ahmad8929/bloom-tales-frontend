'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Truck, Shield, Heart, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewArrival } from '@/components/common/newArrival';
import { Sale } from '@/components/common/sale';
import { features } from '@/dummyData';
import { ScrollingBanner } from '@/components/common/scrollingBanner';
import { ShopByCategory } from '@/components/common/shopByCategory';
import { HeroCarousel } from '@/components/common/heroCarousel';
import { CustomerTestimonials } from '@/components/common/customerTestimonials';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Removed MetaMask detection - not needed for e-commerce app


  return (
    <div className="flex flex-col">
      {/* Top Banner */}
      <ScrollingBanner />


      {/* Hero Carousel Section */}
      <HeroCarousel
        autoPlay={true}
        autoPlayInterval={4000}
        className="mb-0"
      />

     {/* Shop by Category Component */}
      <ShopByCategory 
        showViewAll={true}
        title="Shop by Category"
      />
      
      {/* New Arrivals - Using Enhanced API Component */}
      <NewArrival 
        limit={8} 
        showViewAll={true}
      />

      

      {/* Limited Time Sale - Using Enhanced API Component */}
      <Sale 
        limit={8} 
        showViewAll={true} 
        title="🔥 Limited Time Sale!" 
      />

 {/* Features Section */}
     <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-gray-100 hidden lg:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              // Map icon strings to actual components
              const IconComponent = {
                truck: Truck,
                shield: Shield,
                heart: Heart,
                gift: Gift
              }[feature.icon] || Truck;

              return (
                <Card 
                  key={feature.id} 
                  className="text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-2 group-hover:text-purple-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <CustomerTestimonials
        title="What Our Customers Say"
        subtitle="Real stories from real customers who love shopping with Bloomtales Boutique"
        showCTA={true}
        ctaText="Start Shopping Today"
        ctaLink="/products"
        itemsPerView={{
          mobile: 1,
          tablet: 2,
          desktop: 3
        }}
      />
    </div>
  );
}