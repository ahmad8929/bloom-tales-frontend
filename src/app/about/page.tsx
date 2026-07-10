import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div>
      {/* Header band */}
      <div className="border-b border-border bg-sand/50">
        <div className="container py-14 text-center md:py-20">
          <p className="eyebrow mb-4 animate-fade-up">The Maison</p>
          <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
            Our Story
          </h1>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="img-zoom relative overflow-hidden bg-sand">
            <div className="relative aspect-[4/5]">
              <Image
                src="/hero2/hero-3.png"
                alt="Bloomtales Boutique"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium leading-tight md:text-4xl">
              Elegance, comfort and craft —{' '}
              <em className="font-light italic text-gold">woven together.</em>
            </h2>
            <div className="mt-8 space-y-5 leading-relaxed text-text-muted">
              <p>
                Welcome to <strong className="text-heading">Bloomtales Boutique</strong>, your
                destination for premium women&apos;s wear. We blend elegance, comfort and style to
                create timeless pieces for the modern woman.
              </p>
              <p>
                From chic casuals to sophisticated occasion wear, our collection is designed to
                make you look and feel your best. Every piece is carefully curated to reflect the
                vibrant spirit of India&apos;s fashion culture.
              </p>
              <p>
                Whether you&apos;re shopping online or visiting us in-store, we promise exceptional
                quality, personalised service and an unforgettable shopping experience.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-10 inline-flex items-center gap-3 border border-primary/70 px-10 py-4 font-sans text-[12px] font-semibold uppercase tracking-luxe text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
