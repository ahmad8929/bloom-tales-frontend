
// File: src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      console.log('Redux: Login started');
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ 
      user: User; 
      accessToken: string;
      refreshToken: string;
    }>) => {
      console.log('Redux: Login success', action.payload.user);
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
      
      // Log the updated state
      console.log('Redux: Updated auth state:', {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasToken: !!state.accessToken
      });
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      console.log('Redux: Login failed', action.payload);
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    updateTokens: (state, action: PayloadAction<{
      accessToken: string;
      refreshToken: string;
    }>) => {
      console.log('Redux: Updating tokens');
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      console.log('Redux: Updating user', action.payload);
      state.user = action.payload;
    },
    logout: (state) => {
      console.log('Redux: Logging out');
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
    restoreAuthFromCookie: (state, action: PayloadAction<{ accessToken: string; userRole?: string }>) => {
      // Restore auth state from cookies (used on page load)
      // Note: We only restore the token, user data should be fetched separately
      console.log('Redux: Restoring auth from cookie');
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = !!action.payload.accessToken;
      // Keep user as null - it should be fetched by components that need it
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  updateTokens,
  updateUser,
  logout,
  restoreAuthFromCookie
} = authSlice.actions;

export default authSlice.reducer;