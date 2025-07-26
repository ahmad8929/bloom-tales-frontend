// File: src/hooks/useReduxAuth.ts
'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { loginStart, loginSuccess, loginFailure, logout, updateTokens } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api';
import { setCookie, removeCookie } from '@/lib/utils';
import type { User } from '@/types/auth';

interface LoginResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

interface TokenResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export function useReduxAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    console.log('Starting login process...', credentials.email);
    dispatch(loginStart());
    try {
      const res = await authApi.login(credentials);
      console.log('Login API response:', res);

      const response = res?.data as LoginResponse;
      if (response?.status !== 'success' || !response.data) {
        throw new Error(response?.message || 'Login failed');
      }
      
      const { user, accessToken, refreshToken } = response.data;
      console.log('Login successful, user:', user);
      
      // Store tokens in Redux
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      
      // Set cookies for middleware
      setCookie('auth-token', accessToken);
      setCookie('user-role', user.role);

      // Force reload to ensure all providers are updated
      window.location.href = '/';
      
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      dispatch(loginFailure(err.message));
      return { success: false, error: err.message };
    }
  };

  const refreshAccessToken = async () => {
    console.log('Attempting to refresh token...');
    try {
      if (!refreshToken) throw new Error('No refresh token available');
      
      const res = await authApi.refreshToken(refreshToken);
      console.log('Token refresh response:', res);

      const response = res?.data as TokenResponse;
      if (response?.status !== 'success' || !response.data) {
        throw new Error('Token refresh failed');
      }
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens in Redux
      dispatch(updateTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
      
      // Update cookie
      setCookie('auth-token', newAccessToken);
      
      return { success: true };
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      logoutUser();
      return { success: false, error: err.message };
    }
  };

  const logoutUser = () => {
    console.log('Logging out user...');
    // Clear cookies
    removeCookie('auth-token');
    removeCookie('user-role');
    
    // Clear Redux state
    dispatch(logout());

    // Redirect to login page
    window.location.href = '/login';
  };

  return { 
    user, 
    accessToken,
    refreshToken,
    isLoading, 
    error,
    isAuthenticated,
    login, 
    refreshAccessToken,
    logoutUser 
  };
}