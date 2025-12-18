'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import { loginStart, loginSuccess, loginFailure, logout, updateTokens } from '@/store/slices/authSlice';
import { authApi } from '@/lib/api';
import { setCookie, removeCookie, getCookie } from '@/lib/utils';
import type { User } from '@/types/auth';

interface LoginResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  code?: string;
}

interface ApiErrorResponse {
  status: string;
  message: string;
  code?: string;
}

interface TokenResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  code?: string;
  user?: User;
}

const mapUserResponse = (user: any): User => ({
  ...user,
  id: user._id, // Map _id to id for frontend consistency
});

export function useAuth() {
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, accessToken, refreshToken, isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<AuthResult> => {
    dispatch(loginStart());
    try {
      console.log('Making login API call...');
      const res = await authApi.login(credentials);
      console.log('Login API response:', res);
      
      const response = res?.data as LoginResponse;
      
      if (response?.status === 'success' && response.data) {
        const { user: rawUser, accessToken, refreshToken } = response.data;
        
        // Map user to ensure id field exists
        const user = {
          ...rawUser,
          id: rawUser._id || rawUser.id,
        };
        
        console.log('Login successful - User:', user);
        
        // Store tokens in Redux
        dispatch(loginSuccess({ user, accessToken, refreshToken }));
        
        // Set cookies for middleware (only on client)
        if (typeof window !== 'undefined') {
          console.log('Setting auth cookies...');
          
          // Set cookies
          setCookie('auth-token', accessToken, 7);
          setCookie('user-role', user.role, 7);
          
          console.log('Cookies set successfully');
        }
        
        return { success: true, user };
      } else {
        const errorMessage = response?.message || 'Login failed';
        const errorCode = response?.code;
        
        dispatch(loginFailure(errorMessage));
        return { 
          success: false, 
          error: errorMessage,
          code: errorCode
        };
      }
    } catch (err: any) {
      console.error('Login error caught:', err);
      
      let errorMessage = 'Network error - please check your connection';
      let errorCode: string | undefined;
      
      if (err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch(loginFailure(errorMessage));
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
    }
  };

  const signup = async (signupData: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResult> => {
    try {
      console.log('Making signup API call...');
      const res = await authApi.register(signupData);
      console.log('Signup API response:', res);
      
      if (res.data?.status === 'success') {
        return { 
          success: true,
          user: res.data.data?.user
        };
      } else {
        return {
          success: false,
          error: res.data?.message || 'Signup failed'
        };
      }
    } catch (err: any) {
      console.error('Signup error caught:', err);
      
      let errorMessage = 'An unexpected error occurred';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const resendVerification = async (email: string): Promise<AuthResult> => {
    try {
      console.log('Making resend verification API call for:', email);
      const res = await authApi.resendVerification(email);
      console.log('Resend verification API response:', res);
      
      if (res.data?.status === 'success') {
        return { success: true };
      } else {
        return {
          success: false,
          error: res.data?.message || 'Failed to resend verification email'
        };
      }
    } catch (err: any) {
      console.error('Resend verification error caught:', err);
      
      let errorMessage = 'Failed to send verification email';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
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
    resendVerification, // Added this function
    refreshAccessToken,
    logoutUser,
    isHydrated, // Export this for components that need to wait for hydration
  };
}