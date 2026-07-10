'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/dummyData';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion/primitives';

export function CollectionsEditorial() {
  const featured = categories.slice(0, 2);
  const rest = categories.slice(2, 7);

  return (
    <section className="bg-sand py-20 md:py-28">
      <div className="container">
        <FadeIn className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="eyebrow mb-4">Collections</p>
            <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              Shop the wardrobe
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-luxe text-heading transition-colors hover:text-gold"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        {/* Two editorial features */}
        <Stagger className="grid gap-5 md:grid-cols-2 md:gap-6">
          {featured.map((category) => (
            <StaggerItem key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="img-zoom group relative block overflow-hidden bg-sand"
              >
                <div className="relative aspect-[4/5] sm:aspect-[16/12]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                  <div>
                    <p className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-wider2 text-gold">
                      The Collection
                    </p>
                    <h3 className="font-display text-3xl font-medium !text-ivory md:text-4xl">
                      {category.name}
                    </h3>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center border border-ivory/40 text-ivory transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-white">
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-45" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Remaining collections — slim editorial tiles */}
        <Stagger delay={0.1} className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {rest.map((category) => (
            <StaggerItem key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="img-zoom group block overflow-hidden"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="font-display text-lg text-heading transition-colors group-hover:text-gold">
                    {category.name}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
