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
    <section className="bg-[#C4A082] text-[#5A3E2B] py-2.5 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 animate-pulse opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center">
          <div 
            className="transition-all duration-500 ease-in-out transform"
            key={currentBanner}
            style={{
              animation: 'slideInFade 0.5s ease-in-out'
            }}
          >
            <p className="text-sm font-semibold flex items-center justify-center gap-2 text-[#5A3E2B] drop-shadow-sm">
              <span className="text-lg animate-bounce">
                {bannerOffers[currentBanner].emoji}
              </span>
              <span className="font-bold">
                {bannerOffers[currentBanner].text}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#5A3E2B]/30">
        <div 
          className="h-full bg-[#5A3E2B] transition-all duration-300 ease-linear"
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