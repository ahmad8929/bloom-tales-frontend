'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { logout } from '@/store/slices/authSlice';
import { getCookie } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ResendVerificationModal } from './emailResendModal';
import { ResetPasswordModal } from './PasswordResendModal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const { mergeGuestCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [redirectReason, setRedirectReason] = useState<string | null>(null);

  // Get returnUrl and reason from query params on mount
  useEffect(() => {
    const url = searchParams.get('returnUrl');
    const reason = searchParams.get('reason');
    if (url && url.startsWith('/')) {
      setReturnUrl(url);
    }
    if (reason) {
      setRedirectReason(reason);
    }
  }, [searchParams]);

  // Clear stale Redux auth state if cookies don't exist
  // This handles the case where middleware cleared cookies but Redux still thinks user is authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
    
    // If Redux says authenticated but no cookie exists, clear Redux state
    // This prevents showing "Redirecting..." when user should see login form
    if (isAuthenticated && !cookieToken) {
      console.log('Clearing stale auth state - no cookie found');
      dispatch(logout());
    }
  }, [isAuthenticated, dispatch]);

  // Check if user is actually authenticated (verify with cookies, not just Redux)
  const isActuallyAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    
    // Check cookies first - if no cookie, definitely not authenticated
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
    
    // If there's no cookie token, user is NOT authenticated (even if Redux says otherwise)
    // This handles the case where middleware cleared cookies but Redux state is stale
    if (!cookieToken) {
      return false;
    }
    
    // Only consider authenticated if BOTH Redux and cookies agree AND cookie is valid
    // Cookie must be at least 10 characters (basic validation)
    return isAuthenticated && user && cookieToken.length >= 10;
  };

  // Handle redirect after authentication
  useEffect(() => {
    // Prevent infinite redirects
    if (hasRedirected) return;
    
    if (isActuallyAuthenticated() && returnUrl) {
      setHasRedirected(true);
      // Use window.location for reliable redirect in production
      // Small delay to ensure cookies are set
      const timer = setTimeout(() => {
        window.location.href = returnUrl;
      }, 200);
      return () => clearTimeout(timer);
    } else if (isActuallyAuthenticated() && !returnUrl) {
      setHasRedirected(true);
      // Redirect to home if no returnUrl
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, returnUrl, hasRedirected]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setNeedsEmailVerification(false);

      const result = await login(data);
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.',
        });
        
        // Merge guest cart with user cart after login
        // Set flag to prevent CartInitializer from fetching immediately
        if (typeof window !== 'undefined') {
          (window as any).__cartMergeInProgress = true;
        }
        try {
          await mergeGuestCart();
        } catch (error) {
          console.error('Error merging guest cart:', error);
          // Don't block login if cart merge fails
        } finally {
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              (window as any).__cartMergeInProgress = false;
            }, 2000);
          }
        }
        
        // Get returnUrl from state or query params
        const redirectUrl = returnUrl || searchParams.get('returnUrl');
        
        // Verify cookies are set before redirecting
        // This ensures middleware can see the cookies
        const verifyAndRedirect = async () => {
          let attempts = 0;
          const maxAttempts = 20; // 1 second total wait time
          
          while (attempts < maxAttempts) {
            const cookieToken = getCookie('auth-token');
            
            if (cookieToken && cookieToken.length >= 10) {
              console.log('Cookie verified, redirecting...');
              const redirectPath = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/';
              window.location.href = redirectPath;
              return;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // If verification times out, redirect anyway (cookies should be set)
          console.warn('Cookie verification timeout, redirecting anyway');
          const redirectPath = redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/';
          window.location.href = redirectPath;
        };
        
        // Small delay to ensure Redux state is updated and cart is merged
        setTimeout(verifyAndRedirect, 300);
      } else {
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsEmailVerification(true);
          setUserEmail(data.email);
          setError(result.error || 'Please verify your email.');
          toast({
            title: 'Email Verification Required',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          setError(result.error || 'Login failed');
          toast({
            title: 'Login Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      
      if (err.code === 'EMAIL_NOT_VERIFIED' || errorMessage.includes('verify your email')) {
        setNeedsEmailVerification(true);
        setUserEmail(data.email);
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleOpenVerificationModal = () => setShowVerificationModal(true);
  const handleOpenResetPasswordModal = () => setShowResetPasswordModal(true);
  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
    setNeedsEmailVerification(false);
    setError(null);
  };
  const handleResetPasswordModalClose = () => setShowResetPasswordModal(false);

  // Only show redirecting if actually authenticated (has valid cookies)
  // If we have a redirectReason (like 'auth-required'), it means user was redirected
  // from a protected route, so we should show the login form even if Redux has stale state
  const shouldShowRedirecting = isActuallyAuthenticated() && returnUrl && !redirectReason;
  
  if (shouldShowRedirecting) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Redirecting...
      </div>
    );
  }
  return (
    <>
      <div className="space-y-6 bg-card p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto border border-border">

  
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">
            Welcome Back
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Redirect Reason Alert */}
        {redirectReason && !needsEmailVerification && !error && (
          <Alert className="border-blue-200 bg-blue-50 text-blue-900 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {redirectReason === 'auth-required' && 'Please log in to access this page.'}
              {redirectReason === 'session-expired' && 'Your session has expired. Please log in again to continue.'}
              {returnUrl && (
                <span className="block mt-1 text-sm">
                  You'll be redirected back to {returnUrl} after logging in.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Verification Alert */}
        {needsEmailVerification && (
          <Alert className="border-primary/30 bg-primary/10 text-text-normal rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <AlertDescription>
                Please verify your email before logging in.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenVerificationModal}
              className="border-primary text-primary hover:bg-secondary-hover ml-2"
            >
              Resend Email
            </Button>
          </Alert>
        )}

        {/* General Error Alert */}
        {error && !needsEmailVerification && (
          <Alert variant="destructive" className="rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                        className="h-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-primary" /> : <Eye className="h-4 w-4 text-primary" />}
                        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleOpenResetPasswordModal}
                className="text-sm font-medium text-primary hover:underline h-auto p-0"
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-hover text-primary-foreground font-semibold shadow-md rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In'}
            </Button>
          </form>
        </Form>

        {/* Signup Link */}
        <div className="text-center mt-2">
          <p className="text-sm text-text-normal">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Help Section */}
{/* <div className="text-center pt-6 border-t border-border">
  <p className="text-sm text-text-muted mb-2">
    Need help with your account?
  </p>
  <div className="flex justify-center space-x-4">
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenVerificationModal}
      className="border-primary text-primary hover:bg-secondary-hover h-auto p-2 rounded-lg"
    >
      Resend verification email
    </Button>
  </div>
</div> */}


        {/* Additional Links */}
        <div className="flex justify-center space-x-4 pt-4 text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary hover:underline transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* Modals */}
      <ResendVerificationModal
        open={showVerificationModal}
        onOpenChange={handleVerificationModalClose}
        defaultEmail={userEmail}
      />

      <ResetPasswordModal
        open={showResetPasswordModal}
        onOpenChange={handleResetPasswordModalClose}
        defaultEmail={form.getValues('email')}
      />
    </>
  );
}
