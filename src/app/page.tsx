'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Truck, Shield, Heart, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewArrival } from '@/components/common/newArrival';
import { Sale } from '@/components/common/sale';
import { FeaturedProducts } from '@/components/common/featuredProducts';
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
      {/* <HeroCarousel
        autoPlay={true}
        autoPlayInterval={4000}
        className="mb-0"
      /> */}

     {/* Shop by Category Component */}
      {/* <ShopByCategory 
        showViewAll={true}
        title="Shop by Category"
      /> */}
      
      {/* New Arrivals - Using Enhanced API Component */}
      {/* <NewArrival 
        limit={8} 
        showViewAll={true}
      /> */}

      

      {/* Limited Time Sale - Using Enhanced API Component */}
      {/* <Sale 
        limit={8} 
        showViewAll={true} 
        title="🔥 Limited Time Sale!" 
      /> */}

      {/* Featured Products Section - 10 Products */}
      <FeaturedProducts 
        limit={12} 
        showViewAll={true} 
        title="" 
      />

      {/* Features Section */}
<section className="py-8 md:py-12 lg:py-16 bg-[#f3d9c8] hidden lg:block relative overflow-hidden">
  {/* Soft decorative blobs (same style as testimonials) */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-10 left-10 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-10 right-10 w-20 h-20 bg-accent/20 rounded-full blur-lg animate-bounce"></div>
  </div>

  <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {features.map((feature, index) => {
        const IconComponent = {
          truck: Truck,
          shield: Shield,
          heart: Heart,
          gift: Gift
        }[feature.icon] || Truck;

        return (
          <Card
            key={feature.id}
            className="text-center p-4 md:p-6 border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="p-0">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full">
                <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>

              <h3 className="font-semibold text-sm md:text-base lg:text-lg mb-2 text-heading">
                {feature.title}
              </h3>

              <p className="text-xs md:text-sm text-text-muted leading-relaxed">
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