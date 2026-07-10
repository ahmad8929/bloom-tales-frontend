import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BRAND } from '@/lib/constants';

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Visit', value: BRAND.location },
  { icon: Phone, label: 'Call', value: BRAND.phone },
  { icon: Mail, label: 'Write', value: BRAND.email },
  { icon: Clock, label: 'Hours', value: BRAND.hours },
];

export default function ContactPage() {
  return (
    <div>
      {/* Header band */}
      <div className="border-b border-border bg-sand/50">
        <div className="container py-14 text-center md:py-20">
          <p className="eyebrow mb-4 animate-fade-up">We&apos;re here to help</p>
          <h1 className="animate-fade-up font-display text-4xl font-medium md:text-6xl" style={{ animationDelay: '0.1s' }}>
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-xl animate-fade-up text-text-muted" style={{ animationDelay: '0.2s' }}>
            Have a question or need assistance? Reach out — we love hearing from you.
          </p>
        </div>
      </div>

      <div className="container py-16 md:py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {CONTACT_DETAILS.map((item) => (
            <div key={item.label} className="group flex items-start gap-5 bg-background p-8 transition-colors duration-500 hover:bg-card">
              <item.icon className="mt-1 h-6 w-6 shrink-0 text-gold" strokeWidth={1.25} />
              <div>
                <p className="eyebrow mb-2">{item.label}</p>
                <p className="font-sans text-sm leading-relaxed text-text-normal">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
