'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Truck, Shield, Heart, Gift } from 'lucide-react';
import { FadeIn, Parallax, Stagger, StaggerItem } from '@/components/motion/primitives';
import { Button } from '@/components/ui/button';
import { features } from '@/dummyData';

const FEATURE_ICONS: Record<string, typeof Truck> = {
  truck: Truck,
  shield: Shield,
  heart: Heart,
  gift: Gift,
};

export function StoryEditorial() {
  return (
    <section className="overflow-hidden bg-sand py-20 md:py-28">
      <div className="container">
        {/* Split-screen story */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Parallax amount={40} className="relative order-2 lg:order-1">
            <div className="img-zoom relative overflow-hidden">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/hero2/hero-1.png"
                  alt="Inside the Bloomtales atelier"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            {/* Floating framed detail */}
            <FadeIn
              delay={0.3}
              className="absolute -bottom-8 -right-4 hidden w-44 border-8 border-background shadow-2xl sm:block md:-right-10 md:w-56"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src="/hero2/hero-6.png"
                  alt="Detail of handcrafted embroidery"
                  fill
                  className="object-cover object-top"
                  sizes="224px"
                />
              </div>
            </FadeIn>
          </Parallax>

          <div className="order-1 lg:order-2">
            <FadeIn>
              <p className="eyebrow mb-5">Our Story</p>
              <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
                Slow fashion,
                <br />
                <em className="font-light italic text-gold">thoughtfully</em> made.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-text-muted">
                From the looms of Uttar Pradesh to your wardrobe — every
                Bloomtales piece is chosen for its craft, its drape, and the
                way it makes you feel. We believe in fewer, better things:
                clothing made to be kept, gifted and remembered.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-9">
                <Link href="/about">Read Our Story</Link>
              </Button>
            </FadeIn>
          </div>
        </div>

        {/* Values strip */}
        <Stagger className="mt-20 grid grid-cols-2 gap-px border border-border bg-border md:mt-28 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon] || Truck;
            return (
              <StaggerItem key={feature.id} className="bg-background">
                <div className="group flex h-full flex-col gap-4 p-6 transition-colors duration-500 hover:bg-card md:p-8">
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.25} />
                  <div>
                    <h3 className="font-display text-lg text-heading">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
