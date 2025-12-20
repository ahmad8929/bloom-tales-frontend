'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { setAuthTokenCache, getAuthToken } from '@/lib/api';
import { getCookie } from '@/lib/utils';

export function AuthInitializer() {
  const { refreshAccessToken, accessToken, refreshToken } = useAuth();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      // Sync token cache with cookie/Redux state
      const cookieToken = getCookie('auth-token');
      if (cookieToken) {
        setAuthTokenCache(cookieToken);
      } else if (accessToken) {
        // If Redux has token but cookie doesn't, sync them
        setAuthTokenCache(accessToken);
      }
      
      // Check if we have tokens and refresh if needed
      if (refreshToken && !accessToken) {
        refreshAccessToken();
      }
    }
  }, [accessToken, refreshToken, refreshAccessToken]);

  return null; // This component doesn't render anything
}