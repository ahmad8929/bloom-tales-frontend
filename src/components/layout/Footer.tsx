'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { BRAND, FOOTER_HELP_LINKS, FOOTER_POLICY_LINKS } from '@/lib/constants';

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: BRAND.instagram, label: 'Instagram' },
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
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-8">
            <FooterColumn title="Help" links={FOOTER_HELP_LINKS} />
            <FooterColumn title="Policies" links={FOOTER_POLICY_LINKS} />

            {/* Reach Us */}
            <div>
              <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-luxe text-heading">
                Reach Us
              </p>
              <ul className="space-y-1.5 font-sans text-[13px] text-text-muted">
                <li>
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="flex items-center gap-2 transition-colors hover:text-gold"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                    <span className="break-all">{BRAND.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={BRAND.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-gold"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
                    WhatsApp: {BRAND.phone}
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us On */}
            <div>
              <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-luxe text-heading">
                Follow Us On
              </p>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-8 w-8 items-center justify-center text-gold transition-all duration-300 hover:-translate-y-0.5 hover:text-hover"
                  >
                    <social.icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-center border-t border-sand pt-5">
          <p className="font-sans text-[11px] text-text-muted/80">
            Copyright © {currentYear} {BRAND.legalName} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
