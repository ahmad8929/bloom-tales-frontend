'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { categories } from '@/dummyData';

interface ShopByCategoryProps {
  showViewAll?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ShopByCategory({ 
  showViewAll = true, 
  title = "Shop by Category",
  subtitle = "Explore our curated collections designed for every occasion and style preference",
  className = ""
}: ShopByCategoryProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className={`py-12 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-white relative overflow-hidden ${className}`}>
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 md:top-20 left-4 md:left-10 w-20 md:w-32 h-20 md:h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-12 md:w-20 h-12 md:h-20 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-md animate-pulse delay-100"></div>
        <div className="absolute top-1/3 right-1/3 w-8 md:w-16 h-8 md:h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-sm animate-bounce delay-200"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg shadow-purple-500/25 mb-6 md:mb-8 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 backdrop-blur-lg">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <h2 className="font-headline text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-gray-600 text-sm md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Categories Grid */}
        {/* Categories Grid */}
<div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 md:gap-8 lg:gap-10 max-w-7xl mx-auto">
  {/* Mobile & Tablet: show only first 6 */}
  {categories.slice(0, 6).map((category, index) => (
    <div
      key={category.id}
      className="group flex flex-col items-center lg:hidden" // hide on lg+
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "fadeInUp 0.8s ease-out both",
      }}
    >
      <Link href={`/category/${category.slug}`} className="block">
        {/* Category Card Code */}
        <div className="relative mb-4 md:mb-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full overflow-hidden bg-white shadow-xl shadow-purple-500/10 group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-110 border-4 border-white group-hover:border-purple-200">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
        <h3 className="text-center font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 group-hover:text-purple-600 transition-colors duration-300 mb-2">
          {category.name}
        </h3>
      </Link>
    </div>
  ))}

  {/* Desktop: show all */}
  {categories.map((category, index) => (
    <div
      key={category.id}
      className="group flex flex-col items-center hidden lg:flex" // hide on <lg
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "fadeInUp 0.8s ease-out both",
      }}
    >
      <Link href={`/category/${category.slug}`} className="block">
        {/* Same card UI */}
        <div className="relative mb-4 md:mb-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full overflow-hidden bg-white shadow-xl shadow-purple-500/10 group-hover:shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-110 border-4 border-white group-hover:border-purple-200">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
        <h3 className="text-center font-semibold text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 group-hover:text-purple-600 transition-colors duration-300 mb-2">
          {category.name}
        </h3>
      </Link>
    </div>
  ))}
</div>

      </div>

      {/* Custom Keyframes */}
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
}