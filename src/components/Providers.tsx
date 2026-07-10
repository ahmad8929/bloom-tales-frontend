'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { useEffect, useState } from 'react';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Provider store={store}>
        <ErrorBoundary>
          <SkeletonLoading />
        </ErrorBoundary>
      </Provider>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        {persistor ? (
          <PersistGate loading={<SkeletonLoading />} persistor={persistor}>
            {children}
          </PersistGate>
        ) : (
          children
        )}
      </Provider>
    </ErrorBoundary>
  );
}