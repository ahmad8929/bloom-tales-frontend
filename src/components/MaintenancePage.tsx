'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MaintenancePage() {
  const phoneNumber = '8076465961';
  const message = encodeURIComponent('Hello! I would like to place an order.');
  
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3d9c8] via-[#f5e6d3] to-[#f3d9c8] px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#C4A082]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#5A3E2B]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#25D366]/10 rounded-full blur-xl animate-bounce"></div>
      </div>
      
      <div className="max-w-2xl w-full text-center space-y-8 py-12 relative z-10">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#5A3E2B] mb-2">
            Bloomtales Boutique
          </h1>
        </div>

        {/* Main Message */}
        <div className="space-y-6">
          <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-4">
            <div className="w-20 h-20 mx-auto bg-[#C4A082] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#5A3E2B]">
            We're Currently Under Maintenance
          </h2>

          <p className="text-lg md:text-xl text-[#5A3E2B]/80 leading-relaxed max-w-xl mx-auto">
            Sorry, we are currently in progress. Our website is temporarily unavailable, but we're still here to help you!
          </p>
        </div>

        {/* WhatsApp CTA */}
        <div className="space-y-6 pt-4">
          <p className="text-base md:text-lg text-[#5A3E2B] font-medium">
            You can order us on WhatsApp
          </p>

          <Button
            onClick={handleWhatsAppClick}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            Contact Us on WhatsApp
          </Button>

          <p className="text-sm text-[#5A3E2B]/70 pt-2">
            Click the button above to message us directly on WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}

