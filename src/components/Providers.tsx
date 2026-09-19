'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, serverState } from '@/store';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthInitializer } from '@/components/AuthInitializer';
import { CartInitializer } from '@/components/CartInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const SkeletonLoading = () => (
  <div className="min-h-screen bg-background" suppressHydrationWarning>
    {/* Boutique loading mark */}
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="font-display text-3xl font-semibold tracking-wide text-heading">
          Bloomtales
        </p>
        <p className="mt-1 font-sans text-[9px] font-semibold uppercase tracking-wider2 text-text-muted">
          Boutique
        </p>
      </div>
      <div className="h-px w-24 animate-pulse bg-gold" />
    </div>
  </div>
);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const privatePage = /^\/(admin|cart|checkout|orders|profile|login|signup|verify-email|reset-password)(\/|$)/.test(pathname);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Provider store={store} serverState={serverState}>
        <ErrorBoundary>
          {privatePage ? <SkeletonLoading /> : children}
        </ErrorBoundary>
      </Provider>
    );
  }

  // Keep auth/cart side effects behind persistence, as before public SSR was enabled.
  const hydratedContent = <><AuthInitializer /><CartInitializer />{children}</>;

  return (
    <ErrorBoundary>
      <Provider store={store}>
        {persistor ? (
          <PersistGate loading={<SkeletonLoading />} persistor={persistor}>
            {hydratedContent}
          </PersistGate>
        ) : (
          hydratedContent
        )}
      </Provider>
    </ErrorBoundary>
  );
}