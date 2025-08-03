'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
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

export function useAuth() {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, accessToken, refreshToken, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    dispatch(loginStart());
    try {
      const res = await authApi.login(credentials);
      const response = res?.data as LoginResponse;
      
      if (response?.status !== 'success' || !response.data) {
        throw new Error(response?.message || 'Login failed');
      }
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens in Redux
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      
      // Set cookies for middleware (only on client)
      if (typeof window !== 'undefined') {
        setCookie('auth-token', accessToken);
        setCookie('user-role', user.role);
        // Force reload to ensure all providers are updated
        window.location.href = '/';
      }
      
      return { success: true };
    } catch (err: any) {
      dispatch(loginFailure(err.message));
      return { success: false, error: err.message };
    }
  };

  const signup = async (signupData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const res = await authApi.register(signupData);
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  const refreshAccessToken = async () => {
  try {
    if (!refreshToken) throw new Error('No refresh token available');
    
    const res = await authApi.refreshToken(refreshToken);
    
    // Handle the actual API response structure
    if (res.error) {
      throw new Error(res.error);
    }
    
    // Check if the response has the expected structure
    if (!res.data?.accessToken || !res.data?.refreshToken) {
      throw new Error('Invalid token response format');
    }
    
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
    
    // Update tokens in Redux
    dispatch(updateTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken }));
    
    // Update cookie (only on client)
    if (typeof window !== 'undefined') {
      setCookie('auth-token', newAccessToken);
    }
    
    return { success: true };
  } catch (err: any) {
    logoutUser();
    return { success: false, error: err.message };
  }
};

  const logoutUser = () => {
    // Only manipulate cookies and window on client side
    if (typeof window !== 'undefined') {
      // Clear cookies
      removeCookie('auth-token');
      removeCookie('user-role');
    }
    
    // Clear Redux state
    dispatch(logout());

    // Redirect to login page (only on client)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return { 
    user, 
    accessToken,
    refreshToken,
    isLoading, 
    error,
    isAuthenticated: isHydrated ? isAuthenticated : false, // Prevent hydration mismatch
    login, 
    signup,
    refreshAccessToken,
    logoutUser,
    isHydrated, // Export this for components that need to wait for hydration
  };
}