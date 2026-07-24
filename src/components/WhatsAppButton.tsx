'use client';

import { useEffect, useState } from 'react';
import { BRAND } from '@/lib/constants';

// Must mirror the `bottom-24`/`md:bottom-5` + `h-14` offsets on the anchor
// below — used to detect when the footer would creep into the button's
// resting footprint so it can be lifted clear instead of clipping the
// copyright line.
const MOBILE_CLEARANCE = 96 + 56;
const DESKTOP_CLEARANCE = 20 + 56;
const MD_BREAKPOINT = 768;
const GAP = 16;

/**
 * Sits above the mobile sticky add-to-cart bar (product pages, <md) so the
 * two never overlap; collapses to the standard 20px/20px offset from `md`
 * up, where that bar doesn't render. Also lifts itself clear of the footer
 * once scrolling brings it within the button's resting footprint, so it
 * never sits on top of the footer links/copyright text.
 */
export function WhatsAppButton() {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    let raf = 0;
    const recalc = () => {
      raf = 0;
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      const clearance = window.innerWidth >= MD_BREAKPOINT ? DESKTOP_CLEARANCE : MOBILE_CLEARANCE;
      setLift(Math.max(0, overlap - clearance + GAP));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(recalc);
    };

    recalc();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const phone = BRAND.phone.replace(/\D/g, '');
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(BRAND.whatsappMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={lift ? { transform: `translateY(-${lift}px)` } : undefined}
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-ink/25 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/30 active:scale-95 md:bottom-5 md:right-5"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 fill-current"
      >
        <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.257.594 4.446 1.723 6.374L3.2 28.8l6.6-1.687a12.74 12.74 0 0 0 6.203 1.58h.006c7.068 0 12.8-5.73 12.8-12.8s-5.73-12.693-12.805-12.693Zm0 23.36a10.53 10.53 0 0 1-5.37-1.47l-.385-.228-3.916 1.001 1.045-3.815-.25-.392a10.545 10.545 0 0 1-1.62-5.656c0-5.835 4.75-10.585 10.6-10.585 2.832 0 5.494 1.103 7.494 3.106a10.523 10.523 0 0 1 3.1 7.49c0 5.835-4.75 10.549-10.698 10.549Zm5.8-7.897c-.318-.16-1.882-.928-2.174-1.035-.291-.107-.503-.16-.715.16-.212.32-.821 1.035-1.007 1.248-.185.213-.371.24-.688.08-.318-.16-1.343-.494-2.559-1.573-.946-.842-1.585-1.883-1.77-2.202-.186-.32-.02-.492.14-.652.143-.142.318-.371.477-.557.16-.186.212-.32.318-.533.106-.213.053-.4-.027-.56-.08-.16-.715-1.72-.98-2.356-.258-.618-.52-.534-.715-.544l-.61-.011c-.213 0-.56.08-.853.4-.291.32-1.113 1.088-1.113 2.654 0 1.566 1.14 3.078 1.3 3.29.159.213 2.243 3.425 5.436 4.803.76.328 1.353.524 1.815.671.762.243 1.456.208 2.005.126.612-.091 1.882-.769 2.147-1.512.265-.742.265-1.378.186-1.512-.08-.133-.291-.213-.61-.373Z" />
      </svg>
    </a>
  );
}
