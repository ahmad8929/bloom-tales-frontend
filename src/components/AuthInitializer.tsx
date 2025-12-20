'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { setAuthTokenCache } from '@/lib/api';
import { getCookie } from '@/lib/utils';
import { logout } from '@/store/slices/authSlice';

export function AuthInitializer() {
  const dispatch = useDispatch();
  const { refreshAccessToken, accessToken, refreshToken } = useAuth();

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window !== 'undefined') {
      const cookieToken = getCookie('auth-token');
      
      // CRITICAL: If Redux says we're authenticated but cookies don't exist, clear Redux state
      // This prevents infinite redirect loops when token is deleted
      if (accessToken && !cookieToken) {
        console.warn('Token mismatch: Redux has token but cookies don\'t. Clearing auth state.');
        dispatch(logout());
        setAuthTokenCache(null);
        return;
      }
      
      // Sync token cache with cookie/Redux state
      if (cookieToken) {
        setAuthTokenCache(cookieToken);
      } else if (accessToken) {
        // If Redux has token but cookie doesn't, sync them
        setAuthTokenCache(accessToken);
      }
      
      // Check if we have tokens and refresh if needed
      if (refreshToken && !accessToken && cookieToken) {
        refreshAccessToken();
      }
    }
  }, [accessToken, refreshToken, refreshAccessToken, dispatch]);

  return null; // This component doesn't render anything
}