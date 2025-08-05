'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
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
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Log initial state
  useEffect(() => {
    console.log('Initial auth state:', { isAuthenticated, user });
  }, []);

  // Add effect to handle redirection when authenticated
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, user });
    
    // If already authenticated on mount, redirect immediately
    if (isAuthenticated && user) {
      console.log('Already authenticated, redirecting...');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Submitting login form...', { email: data.email });
      setError(null);
      setNeedsEmailVerification(false);
      
      const result = await login(data);
      
      console.log('Login result received:', result);
      
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.',
        });
        // Redirection is handled in the login function or useEffect
      } else {
        // Handle different types of errors
        console.log('Login failed with code:', result.code, 'message:', result.error);
        
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsEmailVerification(true);
          setUserEmail(data.email);
          setError(result.error || 'Please verify your email address before logging in.');
          
          toast({
            title: 'Email Verification Required',
            description: result.error || 'Please verify your email address before logging in.',
            variant: 'destructive',
          });
        } else {
          setError(result.error || 'Login failed');
          
          toast({
            title: 'Login Failed',
            description: result.error || 'Please check your credentials and try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      console.error('Login catch error:', err);
      
      // Check if it's an email verification error
      if (err.code === 'EMAIL_NOT_VERIFIED' || err.message?.includes('verify your email')) {
        setNeedsEmailVerification(true);
        setUserEmail(data.email);
        setError(err.message || 'Please verify your email address before logging in.');
        
        toast({
          title: 'Email Verification Required',
          description: err.message || 'Please verify your email address before logging in.',
          variant: 'destructive',
        });
      } else {
        setError(err.message || 'An unexpected error occurred');
        
        toast({
          title: 'Login Error',
          description: err.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleOpenVerificationModal = () => {
    setShowVerificationModal(true);
  };

  const handleOpenResetPasswordModal = () => {
    const currentEmail = form.getValues('email');
    setShowResetPasswordModal(true);
  };

  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
    setNeedsEmailVerification(false);
    setError(null);
  };

  const handleResetPasswordModalClose = () => {
    setShowResetPasswordModal(false);
  };

  // If already authenticated, show loading state
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Email Verification Alert */}
        {needsEmailVerification && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">Email verification required</p>
                  <p className="text-sm mt-1">
                    Please verify your email address before logging in.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenVerificationModal}
                  className="ml-4 shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Resend Email
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Alert */}
        {error && !needsEmailVerification && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
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
                  <FormLabel>Password</FormLabel>
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
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Hide password' : 'Show password'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="remember-me" className="text-sm text-muted-foreground">
                  Remember me
                </label> */}
              </div>
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
              className="w-full h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Help Section */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            Need help with your account?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenVerificationModal}
              className="text-primary hover:underline h-auto p-0"
            >
              Resend verification email
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenResetPasswordModal}
              className="text-primary hover:underline h-auto p-0"
            >
              Reset password
            </Button> */}
          </div>
        </div>

        {/* Additional Links */}
        <div className="flex justify-center space-x-4 pt-2">
          <Link
            href="/privacy"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            Terms of Service
          </Link>
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