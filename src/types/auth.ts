export interface User {
  _id: string; // Backend uses _id
  id: string; // This should be mapped from _id for consistency
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}