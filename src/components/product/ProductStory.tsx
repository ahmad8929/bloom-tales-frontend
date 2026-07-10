'use client';

import Link from 'next/link';
import { Sparkles, Shirt, Ruler, Truck } from 'lucide-react';
import { FadeIn, MotionAccordionItem } from '@/components/motion/primitives';
import type { Product } from '@/types/product';

interface ProductStoryProps {
  product: Product;
  careInstructions: string[];
}

/**
 * Editorial storytelling for the product page — accordions instead of a
 * plain spec table. Content is derived from real product data.
 */
export function ProductStory({ product, careInstructions }: ProductStoryProps) {
  const sizes =
    product.variants && product.variants.length > 0
      ? product.variants.filter((v: any) => (v.stock ?? 1) > 0).map((v) => v.size)
      : product.size
        ? [product.size]
        : [];

  const colors =
    product.colors && product.colors.length > 0
      ? product.colors
      : product.color
        ? [product.color]
        : [];

  return (
    <FadeIn className="mx-auto max-w-3xl">
      <p className="eyebrow mb-2 text-center">The Story</p>
      <h2 className="mb-8 text-center font-display text-3xl font-medium md:text-4xl">
        Everything about this piece
      </h2>

      <div className="border-t border-border">
        <MotionAccordionItem
          defaultOpen
          title={
            <span className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.5} /> Why You&apos;ll Love It
            </span>
          }
        >
          <div className="space-y-3">
            {product.description && <p>{product.description}</p>}
            <ul className="space-y-2">
              {product.isNewArrival && (
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  Fresh from our newest collection
                </li>
              )}
              {product.material && (
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  Crafted in {product.material}
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                Handpicked by our stylists — made to be kept, not just bought
              </li>
            </ul>
          </div>
        </MotionAccordionItem>

        <MotionAccordionItem
          title={
            <span className="flex items-center gap-3">
              <Shirt className="h-4 w-4 text-gold" strokeWidth={1.5} /> Fabric &amp; Care
            </span>
          }
        >
          <div className="space-y-3">
            {product.material && (
              <p>
                <span className="font-medium text-heading">Material:</span>{' '}
                <span className="capitalize">{product.material}</span>
              </p>
            )}
            {careInstructions.length > 0 ? (
              <ul className="space-y-2">
                {careInstructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {instruction}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Dry clean recommended for the first wash; gentle hand wash thereafter.</p>
            )}
          </div>
        </MotionAccordionItem>

        <MotionAccordionItem
          title={
            <span className="flex items-center gap-3">
              <Ruler className="h-4 w-4 text-gold" strokeWidth={1.5} /> Details &amp; Fit
            </span>
          }
        >
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {sizes.length > 0 && (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-text-muted">Available sizes</dt>
                <dd className="font-medium text-heading">{sizes.join(', ')}</dd>
              </div>
            )}
            {colors.length > 0 && (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-text-muted">{colors.length > 1 ? 'Colours' : 'Colour'}</dt>
                <dd className="font-medium text-heading">{colors.map((c) => c.name).join(', ')}</dd>
              </div>
            )}
            {product.isStretched && (
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-text-muted">Pre-stretched</dt>
                <dd className="font-medium text-heading">Yes</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 sm:block">
              <dt className="text-text-muted">SKU</dt>
              <dd className="font-medium text-heading">{product._id || product.id}</dd>
            </div>
          </dl>
        </MotionAccordionItem>

        <MotionAccordionItem
          title={
            <span className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-gold" strokeWidth={1.5} /> Shipping &amp; Returns
            </span>
          }
        >
          <div className="space-y-3">
            <p>Shipping across India at ₹149 — orders are usually dispatched within 2–3 business days.</p>
            <p>For international shipping, reach us on WhatsApp and we&apos;ll arrange it personally.</p>
            <p>
              Full details in our{' '}
              <Link href="/shipping" className="text-gold underline-offset-4 hover:underline">
                Shipping &amp; Returns policy
              </Link>
              , or browse the{' '}
              <Link href="/faq" className="text-gold underline-offset-4 hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
        </MotionAccordionItem>
      </div>
    </FadeIn>
  );
}
