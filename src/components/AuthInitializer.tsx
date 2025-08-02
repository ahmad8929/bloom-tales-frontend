'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthInitializer() {
  const { refreshAccessToken, accessToken, refreshToken } = useAuth();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      // Check if we have tokens and refresh if needed
      if (refreshToken && !accessToken) {
        refreshAccessToken();
      }
    }
  }, []);

  return null; // This component doesn't render anything
}