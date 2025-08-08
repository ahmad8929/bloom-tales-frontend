'use client';

import { useState, useEffect } from 'react';
import { bannerOffers } from '@/dummyData';

export function ScrollingBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-scroll banner
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerOffers.length);
    }, 3000);

    return () => clearInterval(bannerTimer);
  }, []);

  return (
    <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-2.5 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <div 
            className="transition-all duration-500 ease-in-out transform"
            key={currentBanner}
            style={{
              animation: 'slideInFade 0.5s ease-in-out'
            }}
          >
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <span className="text-lg animate-bounce">
                {bannerOffers[currentBanner].emoji}
              </span>
              <span className="animate-pulse">
                {bannerOffers[currentBanner].text}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ 
            width: `${((currentBanner + 1) / bannerOffers.length) * 100}%` 
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideInFade {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}