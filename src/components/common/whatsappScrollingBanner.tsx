'use client';

export function WhatsAppScrollingBanner() {
  const handleClick = () => {
    const phoneNumber = '8076465961';
    const message = encodeURIComponent('Hello! I am interested in international shipping.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Create multiple instances of the text for seamless scrolling
  const textItems = Array(8).fill(null);

  return (
    <section 
      // className="whatsapp-banner bg-[#C4A082] text-[#5A3E2B] py-2 overflow-hidden cursor-pointer hover:opacity-95 transition-all duration-300 relative mt-6 mb-6"
      className="whatsapp-banner bg-[#C4A082] text-[#5A3E2B] py-2 overflow-hidden cursor-pointer hover:opacity-95 transition-all duration-300 relative "
      onClick={handleClick}
    >
      {/* Animated Background - similar to scrollingBanner */}
      <div className="absolute inset-0 bg-[#5A3E2B]/5 animate-pulse opacity-20"></div>
      
      <div className="flex items-center py-1.5 whitespace-nowrap relative z-10">
        {/* First set for seamless loop */}
        <div className="flex items-center animate-scroll-infinite">
          {textItems.map((_, index) => (
            <div key={`first-${index}`} className="flex items-center shrink-0 mx-4">
             
              <span className="text-sm italic font-medium text-[#5A3E2B] ml-5">
                For International Shipping -
              </span>
              <span className="bg-[#25D366] text-white px-2 py-0.5 rounded text-xs italic font-light ml-2">
                WhatsApp
              </span>
            </div>
          ))}
        </div>
        {/* Second set for seamless loop */}
        <div className="flex items-center animate-scroll-infinite" aria-hidden="true">
          {textItems.map((_, index) => (
            <div key={`second-${index}`} className="flex items-center shrink-0 mx-4">
             
              <span className="text-sm italic font-medium text-[#5A3E2B] ml-5">
                For International Shipping -
              </span>
              <span className="bg-[#25D366] text-white px-2 py-0.5 rounded text-xs italic font-light ml-2">
                WhatsApp
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

