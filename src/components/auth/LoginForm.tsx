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

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Get returnUrl from query params for redirection after login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Get returnUrl from query params
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      
      // Redirect to returnUrl if provided, otherwise to home
      const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router]);

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
        
        // Get returnUrl from query params for redirection
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl');
        
        // Small delay to ensure token is set in cookies
        setTimeout(() => {
          // Redirect to returnUrl if provided and valid, otherwise to home
          const redirectPath = returnUrl && returnUrl.startsWith('/') ? returnUrl : '/';
          router.push(redirectPath);
        }, 100);
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

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Redirecting...
      </div>
    );
  }
  return (
    <>
      <div className="space-y-6 bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">

  
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-700">
            Welcome Back
          </h1>
          <p className="text-sm text-purple-400 mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Email Verification Alert */}
        {needsEmailVerification && (
          <Alert className="border-purple-300 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <AlertDescription>
                Please verify your email before logging in.
              </AlertDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenVerificationModal}
              className="border-purple-400 text-purple-700 hover:bg-purple-200 ml-2"
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
                  <FormLabel className="text-purple-700">Email Address</FormLabel>
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
                  <FormLabel className="text-purple-700">Password</FormLabel>
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
                        {showPassword ? <EyeOff className="h-4 w-4 text-purple-500" /> : <Eye className="h-4 w-4 text-purple-500" />}
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
                className="text-sm font-medium text-purple-600 hover:underline h-auto p-0"
              >
                Forgot password?
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In'}
            </Button>
          </form>
        </Form>

        {/* Signup Link */}
        <div className="text-center mt-2">
          <p className="text-sm text-purple-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-purple-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Help Section */}
<div className="text-center pt-6 border-t border-purple-200">
  <p className="text-sm text-purple-400 mb-2">
    Need help with your account?
  </p>
  <div className="flex justify-center space-x-4">
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenVerificationModal}
      className="border-purple-400 text-purple-700 hover:bg-purple-200 h-auto p-2 rounded-lg"
    >
      Resend verification email
    </Button>
  </div>
</div>


        {/* Additional Links */}
        <div className="flex justify-center space-x-4 pt-4 text-xs text-purple-400">
          <Link href="/privacy" className="hover:text-purple-600 hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-purple-600 hover:underline">Terms of Service</Link>
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
