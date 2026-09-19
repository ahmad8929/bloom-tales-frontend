import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants/brand';

export function pageMetadata(path: string, title: string, description?: string, image = '/image.png'): Metadata {
  const url = `${BRAND.domain}${path}`;
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_IN', siteName: BRAND.name, url, title, description, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
