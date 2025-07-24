'use client';

import { createContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthState, LoginCredentials, SignupData, User } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isLoading: false, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { user: null, isLoading: false, error: null };
    case 'UPDATE_USER':
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;
    default:
      return state;
  }
}

export const AuthContext = createContext<{
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await authApi.getProfile();
        if (error) throw new Error(error);
        if (data?.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data, error } = await authApi.login(credentials);
      if (error) throw new Error(error);
      if (!data) throw new Error('No data received from server');

      const { token, user } = data;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.email}`
      });

      router.push('/');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
      
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const signup = async (data: SignupData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data: responseData, error } = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      });
      
      if (error) throw new Error(error);
      if (!responseData) throw new Error('No data received from server');

      const { token, user } = responseData;
      if (token) {
        localStorage.setItem('token', token);
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      toast({
        title: 'Welcome to Bloom Tales!',
        description: 'Your account has been created successfully.'
      });

      router.push('/');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Signup failed'
      });
      
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
      router.push('/login');
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      
      toast({
        title: 'Logout failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
} 