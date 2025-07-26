'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/slices/authSlice';
import { getCookie } from '@/lib/utils';
import { authApi } from '@/lib/api';

export function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth state...');
      const token = getCookie('auth-token');
      const userRole = getCookie('user-role');

      if (token) {
        try {
          // Fetch user profile
          const response = await authApi.getProfile();
          console.log('Profile response:', response);

          if (response?.data?.data?.user) {
            console.log('Restoring auth state from cookies');
            dispatch(loginSuccess({
              user: response.data.data.user,
              accessToken: token,
              refreshToken: token, // We don't store refresh token in cookies
            }));
          }
        } catch (error) {
          console.error('Failed to initialize auth state:', error);
        }
      } else {
        console.log('No auth token found in cookies');
      }
    };

    initializeAuth();
  }, [dispatch]);

  return null;
} 