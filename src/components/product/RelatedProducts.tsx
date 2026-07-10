'use client';

import { NewArrival } from '@/components/common/newArrival';

/**
 * "You may also like" — reuses the animated NewArrival carousel with
 * related-products framing beneath the product story.
 */
export function RelatedProducts() {
  return (
    <section className="border-t border-border bg-sand/60">
      <NewArrival limit={8} title="You May Also Like" showViewAll={false} />
    </section>
  );
}
