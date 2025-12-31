'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { getCookie } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    // Wait for hydration to complete before checking auth
    if (!isHydrated) return;

    // Check if user is authenticated (via Redux or cookies)
    const cookieToken = typeof window !== 'undefined' ? getCookie('auth-token') : null;
    const isActuallyAuthenticated = isAuthenticated || (cookieToken && cookieToken.length >= 10);

    if (isActuallyAuthenticated) {
      // User is already logged in, redirect to home
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Show loading or nothing while checking auth
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, don't render the form (redirect will happen)
  const cookieToken = typeof window !== 'undefined' ? getCookie('auth-token') : null;
  if (isAuthenticated || (cookieToken && cookieToken.length >= 10)) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <LoginForm />
    </div>
  );
}
