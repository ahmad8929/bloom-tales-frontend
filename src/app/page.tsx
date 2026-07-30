'use client';

import dynamic from 'next/dynamic';
import { Hero } from '@/components/home/Hero';
import { CollectionsEditorial } from '@/components/home/CollectionsEditorial';
import { Marquee } from '@/components/motion/primitives';

// Below-the-fold sections load lazily to keep the initial bundle lean.
const FeaturedProducts = dynamic(
  () => import('@/components/common/featuredProducts').then((m) => m.FeaturedProducts),
  { ssr: false }
);
const StoryEditorial = dynamic(
  () => import('@/components/home/StoryEditorial').then((m) => m.StoryEditorial),
  { ssr: false }
);
const InstagramReels = dynamic(() => import('@/components/common/instagramReels'), {
  ssr: false,
});

const MARQUEE_WORDS = [
  'New Season',
  'Handpicked Fabrics',
  'Sarees',
  'Kurtis',
  'Lehengas',
  'Modern Silhouettes',
  'Crafted in India',
];

export default function Home() {
  return (
    // Source order is the mobile order (products → marquee → collections), so
    // small screens need no order utilities. The md:order-* values restore the
    // desktop layout (hero → marquee → collections → products) from the same
    // DOM, which keeps every section mounted once across the breakpoint.
    <div className="flex flex-col">
      {/* Cinematic hero — slides beneath the transparent header. Hidden on
          mobile so the page opens straight on products; kept mounted (not
          conditionally rendered) so desktop hydration is unaffected when the
          viewport is resized. */}
      <div className="hidden md:order-1 md:block">
        <Hero />
      </div>

      {/* Featured products — the edit. Leads on mobile. */}
      <div className="md:order-4">
        <FeaturedProducts limit={12} showViewAll={true} title="The Edit" />
      </div>

      {/* Editorial marquee strip */}
      <div className="border-y border-border bg-background md:order-2">
        <Marquee speed={44} className="py-5">
          {MARQUEE_WORDS.map((word, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-8">
              <span className="font-display text-2xl italic text-heading/80 md:text-3xl">
                {word}
              </span>
              <span className="font-sans text-xs text-gold" aria-hidden="true">✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* Shop by collection — editorial grid */}
      <div className="md:order-3">
        <CollectionsEditorial />
      </div>

      {/* Brand story + values */}
      <div className="md:order-5">
        <StoryEditorial />
      </div>

      {/* Instagram reels */}
      <div className="md:order-6">
        <InstagramReels />
      </div>
    </div>
  );
}
