import type { Metadata } from 'next';
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { BRAND } from '@/lib/constants';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — Bloomtales',
  description: "We'd love to hear from you — reach BloomTales Clothing & Co. on WhatsApp or email for questions and custom requests.",
};

const CONTACT_DETAILS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: BRAND.phone,
    sub: 'Quickest way to reach us',
    href: BRAND.whatsapp,
  },
  {
    icon: Mail,
    label: 'Email',
    value: BRAND.email,
    sub: 'For questions & custom requests',
    href: `mailto:${BRAND.email}`,
  },
  { icon: MapPin, label: 'Visit', value: BRAND.location, sub: null, href: null },
  { icon: Clock, label: 'Hours', value: BRAND.hours, sub: null, href: null },
];

export default function ContactPage() {
  return (
    <div>
      {/* Header band */}
      <div className="border-b border-border bg-sand/50">
        <div className="container py-14 text-center md:py-20">
          <p className="eyebrow mb-4 animate-fade-up">Contact Us</p>
          <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
            We&apos;d love to hear from you
          </h1>
          <p className="mx-auto mt-4 max-w-xl animate-fade-up text-text-muted" style={{ animationDelay: '0.2s' }}>
            Have a question, custom request, or just need help choosing your perfect outfit? We&apos;re always here to
            make your BloomTales experience smooth, personal, and special—just like our outfits.
          </p>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact details */}
          <div className="grid h-fit grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-1">
            {CONTACT_DETAILS.map((item) => {
              const body = (
                <>
                  <item.icon className="mt-1 h-6 w-6 shrink-0 text-gold" strokeWidth={1.25} />
                  <div>
                    <p className="eyebrow mb-2">{item.label}</p>
                    <p className="font-sans text-sm leading-relaxed text-text-normal">{item.value}</p>
                    {item.sub && <p className="mt-1 font-sans text-xs text-text-muted">{item.sub}</p>}
                  </div>
                </>
              );
              const className =
                'group flex items-start gap-5 bg-background p-8 transition-colors duration-500 hover:bg-card';
              return item.href ? (
                <a key={item.label} href={item.href} target={item.href.startsWith('mailto') ? '_self' : '_blank'} rel="noopener noreferrer" className={className}>
                  {body}
                </a>
              ) : (
                <div key={item.label} className={className}>
                  {body}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-6 font-display text-2xl text-heading">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
