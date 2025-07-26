'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

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
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, user]);

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
      const result = await login(data);
      
      console.log('Login result:', result);
      
      if (result.success) {
        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.',
        });
        // Redirection is handled in the login function
      } else {
        setError(result.error || 'Login failed');
        toast({
          title: 'Login failed',
          description: result.error || 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // If already authenticated, show loading state
  if (isAuthenticated && user) {
    return <div>Redirecting...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  {...field} 
                  disabled={isLoading}
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
                <Input 
                  type="password" 
                  placeholder="Enter your password" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
  {isLoading ? 'Logging in...' : 'Login'}
</Button>

<div className="flex justify-between text-sm text-muted-foreground mt-2">
  <a href="/forgot-password" className="hover:underline text-primary">
    Forgot password?
  </a>
  <a href="/signup" className="hover:underline text-primary">
    Sign up
  </a>
</div>

      </form>
    </Form>
  );
} 