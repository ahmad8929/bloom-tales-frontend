'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import { loginStart, loginSuccess, loginFailure, logout, updateTokens } from '@/store/slices/authSlice';
import { authApi, setAuthTokenCache } from '@/lib/api';
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
  validationErrors?: Record<string, string>;
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
    
    // On client side, verify that cookies match Redux state
    // If Redux says authenticated but cookies don't exist, clear Redux state
    if (typeof window !== 'undefined' && isAuthenticated && accessToken) {
      const cookieToken = getCookie('auth-token');
      if (!cookieToken) {
        console.warn('Auth state mismatch: Redux authenticated but no cookie. Clearing state.');
        dispatch(logout());
      }
    }
  }, [isAuthenticated, accessToken, dispatch]);

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
        
        // Set cookies and token cache FIRST (before Redux) for middleware
        // This ensures cookies are available when middleware runs
        if (typeof window !== 'undefined') {
          console.log('Setting auth cookies and token cache...');
          
          // Set token cache immediately
          setAuthTokenCache(accessToken);
          
          // Set cookies with proper settings
          setCookie('auth-token', accessToken, 7);
          setCookie('user-role', user.role, 7);
          
          // Wait and verify cookies are actually set before proceeding
          // This is critical for middleware to see the cookies
          await new Promise<void>((resolve) => {
            let attempts = 0;
            const maxAttempts = 10;
            const checkCookie = () => {
              const cookieToken = getCookie('auth-token');
              if (cookieToken && cookieToken === accessToken) {
                console.log('Cookie verified successfully');
                resolve();
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkCookie, 50);
              } else {
                console.warn('Cookie verification timeout, but proceeding anyway');
                resolve();
              }
            };
            checkCookie();
          });
          
          console.log('Cookies and token cache set successfully');
        }
        
        // Store tokens in Redux AFTER cookies are set
        dispatch(loginSuccess({ user, accessToken, refreshToken }));
        
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

  const signup = async (signupData: { firstName?: string; lastName?: string; email?: string; password?: string }): Promise<AuthResult> => {
    dispatch(loginStart());
    try {
      console.log('Making signup API call...');
      // Prepare data to send - lastName is optional
      const dataToSend: { firstName: string; lastName?: string; email: string; password: string } = {
        firstName: signupData.firstName || '',
        email: signupData.email || '',
        password: signupData.password || '',
      };
      // Only include lastName if it's provided and not empty
      if (signupData.lastName && signupData.lastName.trim()) {
        dataToSend.lastName = signupData.lastName.trim();
      }
      const res = await authApi.register(dataToSend);
      console.log('Signup API response:', res);
      
      // TEMPORARY: Auto-login after signup (email verification disabled)
      // TODO: Re-enable email verification flow when email functionality is fixed
      if (res.data?.status === 'success' && res.data.data) {
        const { user: rawUser, accessToken, refreshToken } = res.data.data;
        
        // If tokens are provided, auto-login the user
        if (accessToken && refreshToken) {
          // Map user to ensure id field exists
          const user = {
            ...rawUser,
            id: rawUser._id || rawUser.id,
          };
          
          console.log('Signup successful - Auto-logging in user:', user);
          
          // Set cookies and token cache FIRST (before Redux) for middleware
          if (typeof window !== 'undefined') {
            console.log('Setting auth cookies and token cache...');
            
            // Set token cache immediately
            setAuthTokenCache(accessToken);
            
            // Set cookies with proper settings
            setCookie('auth-token', accessToken, 7);
            setCookie('user-role', user.role, 7);
            
            // Wait and verify cookies are actually set before proceeding
            await new Promise<void>((resolve) => {
              let attempts = 0;
              const maxAttempts = 10;
              const checkCookie = () => {
                const cookieToken = getCookie('auth-token');
                if (cookieToken && cookieToken === accessToken) {
                  console.log('Cookie verified successfully');
                  resolve();
                } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(checkCookie, 50);
                } else {
                  console.warn('Cookie verification timeout, but proceeding anyway');
                  resolve();
                }
              };
              checkCookie();
            });
            
            console.log('Cookies and token cache set successfully');
          }
          
          // Store tokens in Redux AFTER cookies are set
          dispatch(loginSuccess({ user, accessToken, refreshToken }));
          
          return { success: true, user };
        } else {
          // Fallback: no tokens (shouldn't happen with current implementation)
          return { 
            success: true,
            user: rawUser
          };
        }
      } else {
        const errorMessage = res.data?.message || 'Signup failed';
        dispatch(loginFailure(errorMessage));
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err: any) {
      console.error('Signup error caught:', err);
      
      let errorMessage = 'An unexpected error occurred';
      let validationErrors: Record<string, string> = {};
      
      // Extract detailed validation errors from API response
      if (err.response?.data?.error?.errors) {
        const errors = err.response.data.error.errors;
        // Convert Mongoose validation errors to a simple object
        Object.keys(errors).forEach((key) => {
          if (errors[key]?.message) {
            validationErrors[key] = errors[key].message;
          }
        });
        
        // Create a user-friendly error message from validation errors
        const errorMessages = Object.values(validationErrors);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join(', ');
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      dispatch(loginFailure(errorMessage));
      return {
        success: false,
        error: errorMessage,
        validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : undefined
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
      
      // Update cookie and token cache (only on client)
      if (typeof window !== 'undefined') {
        setAuthTokenCache(newAccessToken);
        setCookie('auth-token', newAccessToken, 7);
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
      // Clear token cache
      setAuthTokenCache(null);
      
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