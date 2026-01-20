import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { AuthInitializer } from '@/components/AuthInitializer';
import { CartInitializer } from '@/components/CartInitializer';
import { Toaster } from '@/components/ui/toaster';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bloomtales.com'),
  title: {
    default: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
    template: '%s | Bloomtales Boutique',
  },
  description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Shop our curated collection of sarees, kurtis, ethnic wear, and modern clothing with premium quality and craftsmanship. Shipping across all of India.',
  keywords: [
    'women fashion',
    'sarees',
    'kurtis',
    'ethnic wear',
    'boutique',
    'online shopping',
    'traditional wear',
    'modern clothing',
    'indian fashion',
    'anarkali',
    'lehenga',
    'bloomtales',
    'women clothing',
    'fashion boutique',
    'premium clothing',
  ],
  authors: [{ name: 'Mohd Ahmad', url: 'https://www.linkedin.com/in/ahmad8929/' }],
  creator: 'Mohd Ahmad',
  publisher: 'Bloomtales Boutique',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bloomtales.com',
    siteName: 'Bloomtales Boutique',
    title: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
    description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Shop premium quality sarees, kurtis, ethnic wear, and modern clothing. Shipping across all of India.',
    images: [
      {
        url: '/image.png',
        width: 1200,
        height: 630,
        alt: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
    description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Premium quality ethnic and modern wear. Shipping across all of India.',
    images: ['/image.png'],
    creator: '@bloomtales_clothing',
    site: '@bloomtales_clothing',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://bloomtales.com',
  },
  category: 'Fashion',
  classification: 'E-commerce, Fashion, Clothing',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Bloomtales',
  },
  icons: {
    icon: [
      { url: '/image.png', type: 'image/png' },
      { url: '/image.png', type: 'image/png', sizes: '32x32' },
      { url: '/image.png', type: 'image/png', sizes: '16x16' },
      { url: '/image.png', type: 'image/png', sizes: '192x192' },
      { url: '/image.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/image.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="color-scheme" content="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Bareilly, Uttar Pradesh" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <link rel="manifest" href="/manifest.json" />
        {/* Primary favicon - Google looks for this first */}
        <link rel="icon" type="image/png" href="/image.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/image.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/image.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/image.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/image.png" />
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/image.png" />
        {/* Shortcut icon */}
        <link rel="shortcut icon" href="/image.png" />
        <meta name="application-name" content="Bloomtales Boutique" />
        <meta name="apple-mobile-web-app-title" content="Bloomtales" />
        <meta name="msapplication-TileImage" content="/image.png" />
        <meta name="msapplication-TileColor" content="#B88A4E" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:secure_url" content="https://bloomtales.com/image.png" />
        <meta property="og:image" content="https://bloomtales.com/image.png" />
        <meta property="og:url" content="https://bloomtales.com" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="yandex" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              "name": "Bloomtales Boutique",
              "description": "Discover the latest in women's fashion at Bloomtales Boutique. Shop premium quality sarees, kurtis, ethnic wear, and modern clothing.",
              "url": "https://bloomtales.com",
              "logo": "https://bloomtales.com/image.png",
              "image": "https://bloomtales.com/image.png",
              "priceRange": "₹₹",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bareilly",
                "addressRegion": "Uttar Pradesh",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://www.facebook.com/bloomtales",
                "https://www.instagram.com/bloomtales",
                "https://twitter.com/bloomtales_clothing"
              ],
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="expires" content="never" />
        <meta name="copyright" content="Bloomtales Boutique" />
        <meta name="designer" content="Mohd Ahmad" />
        <meta name="reply-to" content="bloomtalesclothing@gmail.com" />
        <meta name="owner" content="Bloomtales Boutique" />
        <meta name="url" content="https://bloomtales.com" />
        <meta name="identifier-URL" content="https://bloomtales.com" />
        <meta name="directory" content="submission" />
        <meta name="pagename" content="Bloomtales Boutique - Women's Fashion & Ethnic Wear" />
        <meta name="category" content="Fashion, E-commerce, Clothing" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="canonical" href="https://bloomtales.com" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <AuthInitializer />
          <CartInitializer />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
          <OfflineIndicator />
        </Providers>
      </body>
    </html>
  );
}