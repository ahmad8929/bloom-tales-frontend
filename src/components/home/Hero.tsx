'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloatingDepth } from '@/components/motion/primitives';
import { EASE_LUXE, HERO_SLIDE_MS } from '@/lib/constants';

const SLIDES = [
  { src: '/hero2/hero-1.png', alt: 'Bloomtales — lakeside palace, rose embroidered suit' },
  { src: '/hero2/hero-2.png', alt: 'Bloomtales — sage embroidered co-ord in the garden' },
  { src: '/hero2/hero-3.png', alt: 'Bloomtales — peach embroidered suit, courtyard blooms' },
  { src: '/hero2/hero-4.png', alt: 'Bloomtales — ivory embroidered co-ord, the atelier' },
  { src: '/hero2/hero-5.png', alt: 'Bloomtales — deep red embroidered suit, jaali light' },
  { src: '/hero2/hero-6.png', alt: 'Bloomtales — navy embroidered suit, signature drapes' },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(next, HERO_SLIDE_MS);
    return () => clearInterval(t);
  }, [next, reduce]);

  return (
    <section className="relative overflow-hidden bg-blush">
      <div className="container grid min-h-[calc(100svh-4rem)] items-center gap-10 py-14 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-12 lg:gap-14 lg:py-16">
        {/* Editorial copy */}
        <div className="relative z-10 lg:col-span-6 xl:col-span-5">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE_LUXE }}
            className="mb-5 font-sans text-[11px] font-semibold uppercase tracking-wider2 text-gold"
          >
            The New Season Edit
          </motion.p>

          <h1
            className="overflow-hidden font-display text-5xl font-semibold leading-[1.05] text-heading sm:text-6xl lg:text-7xl xl:text-[80px]"
            style={{ textShadow: 'hsl(var(--ink) / 0.1) 0 1px 2px, hsl(var(--gold) / 0.35) 0 12px 36px' }}
          >
            {['Where every thread', 'tells a story.'].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.35 + i * 0.14, ease: EASE_LUXE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE_LUXE }}
            className="text-depth-soft mt-6 max-w-lg text-base font-medium leading-relaxed text-subheading md:text-lg"
          >
            Handpicked sarees, kurtis and modern silhouettes — crafted for the
            women who wear their stories beautifully.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: EASE_LUXE }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button asChild size="lg">
              <Link href="/products?isNewArrival=true">Shop New Arrivals</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/products">Explore Collection</Link>
            </Button>
          </motion.div>
        </div>

        {/* Rotating imagery — drifts gently toward the cursor */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.45, ease: EASE_LUXE }}
          className="relative lg:col-span-6 xl:col-span-7"
        >
          {/* Floating depth layers behind the frame */}
          <div
            className="animate-float-slow pointer-events-none absolute -right-6 -top-8 hidden h-28 w-28 rounded-full border border-heading/20 lg:block"
            aria-hidden="true"
          />
          <div
            className="animate-float-slower animate-gradient-luxe pointer-events-none absolute -bottom-10 -left-8 hidden h-36 w-36 rounded-full opacity-70 blur-sm lg:block"
            aria-hidden="true"
          />

          <FloatingDepth depth={14} className="img-zoom relative mx-auto aspect-[3/4] max-h-[72svh] w-full max-w-md overflow-hidden shadow-2xl shadow-heading/20 lg:ml-auto xl:max-w-lg">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.2, ease: 'easeInOut' },
                  scale: { duration: HERO_SLIDE_MS / 1000 + 1.5, ease: 'linear' },
                }}
                className="absolute inset-0"
              >
                <Image
                  src={SLIDES[index].src}
                  alt={SLIDES[index].alt}
                  fill
                  priority={index === 0}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
              </motion.div>
            </AnimatePresence>
          </FloatingDepth>

          {/* Slide progress */}
          <div className="mt-5 flex items-center justify-center gap-4 lg:justify-end">
            <span className="font-sans text-xs tracking-luxe text-heading/70">
              {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className="group py-2"
                >
                  <span
                    className={`block h-px transition-all duration-500 ${
                      i === index ? 'w-12 bg-gold' : 'w-8 bg-heading/30 group-hover:bg-heading/60'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Soft tonal wash for depth */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-ivory/60 blur-3xl"
        aria-hidden="true"
      />
    </section>
  );
}
