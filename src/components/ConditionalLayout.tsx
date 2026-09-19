'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollingBanner } from './common/scrollingBanner';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { FloatingCartButton } from '@/components/FloatingCartButton';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // For admin routes, don't show header and footer
    return <>{children}</>;
  }

  // For regular routes, show header and footer
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollingBanner />
      <Suspense fallback={<div className="h-20" />}><Header /></Suspense>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
    </div>
  );
}