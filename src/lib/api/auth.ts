import type { AuthResponse } from '@/types/auth';
import { API_URL, api } from './client';

// Auth endpoints use raw fetch (no auth header/retry) because they run
// before a session exists and callers inspect the error response body.
async function postAuth<T = any>(endpoint: string, payload: unknown, fallbackError: string): Promise<{ data: T }> {
  const response = await fetch(`${API_URL}/api/auth${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || fallbackError);
    (error as any).response = { data };
    throw error;
  }

  return { data };
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    postAuth('/login', credentials, 'Login failed'),

  register: (signupData: { firstName: string; lastName: string; email: string; password: string }) =>
    postAuth('/register', signupData, 'Signup failed'),

  resendVerification: (email: string) =>
    postAuth('/resend-verification', { email }, 'Failed to resend verification'),

  refreshToken: async (refreshToken: string) => {
    try {
      const { data } = await postAuth('/refresh-token', { refreshToken }, 'Token refresh failed');
      return { data: data.data };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  },

  // OTP-based password reset
  sendResetOTP: (data: { email: string }) =>
    postAuth('/send-reset-otp', data, 'Failed to send OTP'),

  verifyResetOTP: (data: { email: string; otp: string }) =>
    postAuth('/verify-reset-otp', data, 'Failed to verify OTP'),

  resetPasswordWithToken: (data: { resetToken: string; password: string }) =>
    postAuth('/reset-password', data, 'Failed to reset password'),

  // Session-authenticated endpoints
  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (token: string, data: { password: string }) =>
    api.post<{ message: string }>(`/auth/reset-password/${token}`, data),

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email/${token}`),

  getProfile: () => api.get<AuthResponse>('/auth/me'),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<AuthResponse>('/auth/update-password', data),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),
};
