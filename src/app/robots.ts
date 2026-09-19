import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/checkout', '/cart', '/orders', '/profile', '/account', '/login', '/signup', '/verify-email', '/reset-password', '/api'],
      },
    ],
    sitemap: `${BRAND.domain}/sitemap.xml`,
  };
}
