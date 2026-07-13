import type { Metadata } from 'next';
import { MessageCircle, Instagram, Star } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Customer Reviews — Bloomtales',
  description: 'What our customers say about their BloomTales outfits — and how to share your own story.',
};

interface Review {
  name: string;
  city: string;
  rating: number;
  text: string;
}

const REVIEWS: Review[] = [
  {
    name: 'Priya Sharma',
    city: 'New Delhi',
    rating: 5,
    text: 'Ordered a lehenga for my sister’s wedding and shared my measurements on WhatsApp — the fit was absolutely perfect. The embroidery looked even better in person than in the photos.',
  },
  {
    name: 'Ananya Iyer',
    city: 'Bengaluru',
    rating: 5,
    text: 'The fabric quality genuinely surprised me. You can tell each piece is made with care and not mass-produced. My kurti set gets compliments every single time I wear it.',
  },
  {
    name: 'Ritika Verma',
    city: 'Lucknow',
    rating: 5,
    text: 'I asked for a small change in the sleeve length and they customized it without any fuss. Lovely team, very responsive on WhatsApp. This is what made-to-order should feel like.',
  },
  {
    name: 'Sneha Patil',
    city: 'Pune',
    rating: 4,
    text: 'Beautiful saree, gorgeous colour and finish. Delivery took a little while since it’s stitched to order, but the tracking updates kept me at ease — and it was worth the wait.',
  },
  {
    name: 'Neha Agarwal',
    city: 'Bareilly',
    rating: 5,
    text: 'So proud that this brand is from my city! My anarkali fit like it was made just for me — because it was. The packaging felt like opening a gift.',
  },
  {
    name: 'Mehak Khan',
    city: 'Jaipur',
    rating: 5,
    text: 'Wore my BloomTales outfit to a family function and everyone asked where it was from. The attention to detail in the dupatta border is something you don’t see in store-bought pieces.',
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          strokeWidth={1.25}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div>
      {/* Header band */}
      <div className="border-b border-border bg-sand/50">
        <div className="container py-14 text-center md:py-20">
          <p className="eyebrow mb-4 animate-fade-up">Loved &amp; Worn</p>
          <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
            Customer Reviews
          </h1>
          <p className="mx-auto mt-4 max-w-xl animate-fade-up text-text-muted" style={{ animationDelay: '0.2s' }}>
            Every BloomTales outfit is made to order, and nothing makes us happier than seeing it worn and loved.
          </p>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        {/* Review grid */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure key={review.name} className="flex flex-col border border-border bg-background p-7">
              <Stars rating={review.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-text-muted">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="font-display text-base text-heading">{review.name}</p>
                <p className="font-sans text-xs text-text-muted">{review.city}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Share your story */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <h2 className="font-display text-2xl text-heading md:text-3xl">Your story could be here</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
            Received your BloomTales outfit? Share a photo and a few words with us — we&apos;d love to feature you.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3 font-sans text-sm text-text-normal transition-colors hover:bg-card"
            >
              <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Share on WhatsApp
            </a>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-background px-6 py-3 font-sans text-sm text-text-normal transition-colors hover:bg-card"
            >
              <Instagram className="h-4 w-4 text-gold" strokeWidth={1.5} />
              Tag us on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
