'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import {
  BRAND,
  FOOTER_SHOP_LINKS,
  FOOTER_CARE_LINKS,
  FOOTER_COMPANY_LINKS,
} from '@/lib/constants';

const SOCIAL_LINKS = [
  { icon: Instagram, href: BRAND.instagram, label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Mail, href: `mailto:${BRAND.email}`, label: 'Email' },
];

function FooterColumn({ title, links }: { title: string; links: readonly { name: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-luxe text-heading">
        {title}
      </p>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="font-sans text-[13px] text-text-muted transition-colors hover:text-gold"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-sand bg-ivory">
      <div className="container py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          {/* Brand */}
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-text-muted">
              Sarees, kurtis and modern silhouettes, curated with an eye for
              craft — born in Bareilly, worn everywhere.
            </p>

            <div className="mt-4 space-y-1.5 font-sans text-[12px] text-text-muted">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                {BRAND.location}
              </p>
              <a href={`tel:${BRAND.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 transition-colors hover:text-gold">
                <Phone className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                {BRAND.phone}
              </a>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                {BRAND.hours}
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('mailto') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center text-gold transition-all duration-300 hover:-translate-y-0.5 hover:text-hover"
                >
                  <social.icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-8">
            <FooterColumn title="Shop" links={FOOTER_SHOP_LINKS} />
            <FooterColumn title="Support" links={FOOTER_CARE_LINKS} />
            <FooterColumn title="Company" links={FOOTER_COMPANY_LINKS} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-center border-t border-sand pt-5">
          <p className="font-sans text-[11px] text-text-muted/80">
            © {currentYear} Bloomtales Boutique. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
