'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be under 50 characters')
      .regex(NAME_REGEX, 'First name can only contain letters'),
    lastName: z
      .string()
      .max(50, 'Last name must be under 50 characters')
      .refine((v) => v === '' || NAME_REGEX.test(v), 'Last name can only contain letters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...signupData } = data;
    setIsLoading(true);

    try {
      const result = await signup(signupData);
      if (result && result.success) {
        // TEMPORARY: Auto-login after signup (email verification disabled)
        // TODO: Update message when email verification is re-enabled
        toast({
          title: 'Account created successfully!',
          description: 'You have been automatically logged in.',
        });
        form.reset();
        // Redirect to home page after successful signup and auto-login
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        // Handle validation errors from API
        if (result?.validationErrors) {
          const validationErrors = result.validationErrors;
          // Set field-specific errors
          Object.keys(validationErrors).forEach((field) => {
            const fieldName = field as keyof SignupFormData;
            if (fieldName in form.getValues()) {
              form.setError(fieldName, {
                type: 'server',
                message: validationErrors[field],
              });
            }
          });
          
          // Show toast with first error message
          const firstError = Object.values(validationErrors)[0];
          toast({
            title: 'Validation Error',
            description: firstError || 'Please check the form for errors',
            variant: 'destructive',
          });
        } else {
          // Generic error
          toast({
            title: 'Signup failed',
            description: result?.error || 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card p-8 sm:p-10 max-w-md mx-auto border border-border">
      <div className="text-center">
        <p className="eyebrow mb-3">Join us</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-heading">Create an account</h1>
        <p className="text-sm text-text-muted mt-2">
          Enter your information below to create your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="First Name" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Last Name" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
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
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...field}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  At least 8 characters, with a letter and a number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...field}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-10 bg-primary hover:bg-hover text-primary-foreground font-semibold transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-primary hover:text-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
