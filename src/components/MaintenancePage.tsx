'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MaintenancePage() {
  const phoneNumber = '918076465961'; // Added country code 91 for India
  const message = encodeURIComponent('Hello! I would like to place an order.');
  
  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3d9c8] via-[#e8d4c0] to-[#d4c0a8]  relative overflow-hidden"
    >
      {/* Decorative Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#C4A082]/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#5A3E2B]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#25D366]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div> */}

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Icon/Logo Area */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#C4A082] to-[#5A3E2B] rounded-full  shadow-lg">
              <MessageCircle className="w-8 h-8 md:w-8 md:h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          {/* <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#5A3E2B] mb-4">
            We're Currently Under Maintenance
          </h1> */}

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#5A3E2B]/80 mb-8 leading-relaxed">
            Sorry, we are currently in progress. 
            <br className="hidden md:block" />
            You can order us on WhatsApp!
          </p>

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsAppClick}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-6 text-lg md:text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-6"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mr-3" />
            Order on WhatsApp
          </Button>

          {/* Additional Info */}
          {/* <p className="text-sm md:text-base text-[#5A3E2B]/60 mt-6">
            We'll be back soon with an improved experience!
          </p> */}
        </div>
      </div>
    </div>
  );
}
