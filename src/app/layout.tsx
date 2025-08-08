import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
  description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Shop our curated collection of sarees, kurtis, ethnic wear, and modern clothing with premium quality and craftsmanship.',
  keywords: 'women fashion, sarees, kurtis, ethnic wear, boutique, online shopping, traditional wear, modern clothing',
  authors: [{ name: 'Mohd Ahmad', url: 'https://www.linkedin.com/in/ahmad8929/' }],
  creator: 'Mohd Ahmad',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bloomtales.com',
    title: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
    description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Premium quality ethnic and modern wear.',
    siteName: 'Bloomtales Boutique',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bloomtales Boutique - Women\'s Fashion & Ethnic Wear',
    description: 'Discover the latest in women\'s fashion at Bloomtales Boutique. Premium quality ethnic and modern wear.',
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <AuthInitializer />
          <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}