'use client';

import { Marquee } from '@/components/motion/primitives';
import { BRAND } from '@/lib/constants';

const ANNOUNCEMENTS = [
  'Shipping across India at ₹149',
  'New arrivals every week',
  'Complimentary gift wrapping on all orders',
  'For international shipping, reach us on WhatsApp',
  'Secure payments · Quality assured',
];

export function ScrollingBanner() {
  const handleClick = () => {
    const phoneNumber = BRAND.phone.replace(/\D/g, ''); // e.g. "+91 8076465961" -> "918076465961"
    const message = encodeURIComponent('Hello! I am interested in international shipping.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div
      className="cursor-pointer bg-heading text-ivory"
      onClick={handleClick}
      role="banner"
    >
      <Marquee speed={40} className="py-2">
        {ANNOUNCEMENTS.map((text, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-6 font-sans text-[10.5px] font-medium uppercase tracking-luxe text-ivory/90"
          >
            {text}
            <span className="text-gold-soft" aria-hidden="true">◆</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
