import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'FAQs — Bloomtales',
  description: 'Answers about shipping, returns, exchanges, payments and made-to-order outfits at BloomTales Clothing & Co.',
};

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

const FAQ_GROUPS: FaqGroup[] = [
  {
    title: 'Shipping and Returns',
    items: [
      {
        q: 'Do you ship internationally?',
        a: (
          <>
            <p>Yes, we ship worldwide 🌍</p>
            <p>
              If your country isn&apos;t visible at checkout, simply drop us a message on{' '}
              <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold underline-offset-4 hover:underline">
                WhatsApp at {BRAND.phone}
              </a>
              —we&apos;ll make it happen for you.
            </p>
            <p>Because BloomTales deserves to reach you, wherever you are.</p>
          </>
        ),
      },
      {
        q: 'How long does shipping take?',
        a: (
          <>
            <p>Each BloomTales piece is made just for you:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Processing Time:</strong> 7–10 working days</li>
              <li><strong>Delivery Time:</strong> Varies by location (tracking will be shared once shipped)</li>
            </ul>
            <p>
              For superfast or urgent orders, WhatsApp us on{' '}
              <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold underline-offset-4 hover:underline">
                {BRAND.phone}
              </a>
              .
            </p>
            <p>Good things take time—and your outfit is worth the wait.</p>
          </>
        ),
      },
      {
        q: 'What is your returns & exchanges policy?',
        a: (
          <>
            <p>Each piece is carefully inspected before dispatch to ensure it reaches you in perfect condition.</p>
            <p>
              <strong>Returns:</strong> Returns are not accepted. However, in the unlikely event that an item arrives
              damaged, please notify us within 24 hours of delivery, and we will assist you accordingly.
            </p>
            <p>
              <strong>Exchanges:</strong> Size exchanges are available for the same product within 7 days of delivery,
              subject to availability. The item must be unused, unaltered, and returned in its original packaging with
              all tags intact. Applicable courier charges for exchanges may apply.
            </p>
            <p>
              <strong>International Orders:</strong> Please note that returns and exchanges are not applicable for
              international orders.
            </p>
          </>
        ),
      },
      {
        q: 'Can I cancel my order?',
        a: (
          <>
            <p>Changed your mind? We understand.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Cancellations are allowed within 24 hours of placing your order</li>
              <li>After that, your piece is already being handcrafted—so it cannot be cancelled</li>
            </ul>
            <p>Because once we begin, we pour our heart into it.</p>
          </>
        ),
      },
      {
        q: 'What payment methods do you accept?',
        a: (
          <>
            <p>We offer secure and easy payment options:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>UPI / Debit &amp; Credit Cards</li>
              <li>Net Banking</li>
              <li>Wallets (if enabled)</li>
            </ul>
            <p>All payments are 100% secure—so you can shop stress-free.</p>
          </>
        ),
      },
    ],
  },
  {
    title: 'Order Related',
    items: [
      {
        q: 'Are your outfits ready-to-wear or made-to-order?',
        a: (
          <>
            <p>Every BloomTales outfit is made to order.</p>
            <p>No mass production. No shortcuts.</p>
            <p>
              Once you place your order, our artisans begin crafting your piece with care and precision—just for you.
              Because you deserve something truly yours.
            </p>
          </>
        ),
      },
      {
        q: 'How can I customize an order?',
        a: (
          <>
            <p>Your outfit, your way.</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                You can customize size, fit, length, and small details by sharing your measurements after placing your
                order via WhatsApp or email.
              </li>
              <li>
                For design customizations, we recommend contacting us before placing your order—so we can bring your
                vision to life beautifully.
              </li>
            </ul>
            <p>Because at BloomTales, every detail matters.</p>
          </>
        ),
      },
      {
        q: 'How should I care for my outfit?',
        a: (
          <>
            <p>Treat it like something special—because it is:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dry clean only</li>
              <li>Handle gently</li>
              <li>Store with care</li>
            </ul>
            <p>
              Our pieces are crafted with delicate fabrics and intricate details, so a little extra love keeps them
              looking timeless.
            </p>
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      {/* Header band */}
      <div className="border-b border-border bg-sand/50">
        <div className="container py-14 text-center md:py-20">
          <p className="eyebrow mb-4 animate-fade-up">Help &amp; Support</p>
          <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl animate-fade-up text-text-muted" style={{ animationDelay: '0.2s' }}>
            Everything you need to know about shipping, exchanges, payments and your made-to-order outfit.
          </p>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-14">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="eyebrow mb-6">{group.title}</h2>
              <div className="divide-y divide-border border-y border-border">
                {group.items.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-heading [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-muted">{item.a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <p className="text-center text-sm text-text-muted">
            Still have a question?{' '}
            <a href={BRAND.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gold underline-offset-4 hover:underline">
              WhatsApp us on {BRAND.phone}
            </a>{' '}
            or email{' '}
            <a href={`mailto:${BRAND.email}`} className="text-gold underline-offset-4 hover:underline">
              {BRAND.email}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
