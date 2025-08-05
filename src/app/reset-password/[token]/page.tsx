'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordResponse {
  status: 'success' | 'error';
  message: string;
}

export default function ResetPassword({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validating reset token...');
  const [token, setToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };
    
    getParams();
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        console.log('Validating reset token:', token);
        const { data, error } = await api.get<ResetPasswordResponse>(`/auth/validate-reset-token/${token}`);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data?.status === 'success') {
          setStatus('form');
          setMessage('Token validated. Please enter your new password.');
        } else {
          throw new Error(data?.message || 'Invalid or expired reset token');
        }
      } catch (error: any) {
        console.error('Token validation error:', error);
        setStatus('error');
        setMessage(error.message || 'The reset link is invalid or has expired.');
        
        toast({
          title: 'Invalid Reset Link',
          description: 'The reset link is invalid or has expired.',
          variant: 'destructive',
        });
      }
    };

    // Add a small delay to show loading state
    const timer = setTimeout(validateToken, 1000);
    return () => clearTimeout(timer);
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      console.log('Resetting password with token:', token);
      const response = await api.post<ResetPasswordResponse>('/auth/reset-password', {
        token,
        password: data.password,
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.status === 'success') {
        setStatus('success');
        setMessage(response.data.message || 'Your password has been reset successfully!');
        
        toast({
          title: 'Password Reset!',
          description: 'Your password has been updated. You can now log in with your new password.',
        });

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              router.push('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdownInterval);
      } else {
        throw new Error(response.data?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Key className="h-6 w-6 text-primary" />
              <span>Reset Password</span>
            </CardTitle>
            <CardDescription>
              Processing reset request
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Key className="h-6 w-6 text-primary" />
            <span>Reset Password</span>
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Validating reset token'}
            {status === 'form' && 'Create your new password'}
            {status === 'success' && 'Password reset successfully'}
            {status === 'error' && 'Reset link invalid'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'form' && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Please choose a strong password with at least 8 characters.
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your new password"
                              {...field}
                              disabled={isSubmitting}
                              className="h-10 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isSubmitting}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your new password"
                              {...field}
                              disabled={isSubmitting}
                              className="h-10 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isSubmitting}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page in {countdown} seconds...
                </p>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => router.push('/login')} 
                    className="flex-1"
                  >
                    Go to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The reset link may have expired or is invalid.
                </p>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => router.push('/login')} 
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    You can request a new password reset link from the login page
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}