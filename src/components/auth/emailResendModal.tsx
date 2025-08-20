'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ResendVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export function ResendVerificationModal({
  open,
  onOpenChange,
  defaultEmail = '',
}: ResendVerificationModalProps) {
  const [isResending, setIsResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  useEffect(() => {
    form.setValue('email', defaultEmail);
  }, [defaultEmail, form]);

  const handleResendVerification = async (data: EmailFormData) => {
    setIsResending(true);
    try {
      const response = await authApi.resendVerification(data.email);

      if (response.data?.status === 'success') {
        setVerificationSent(true);

        toast({
          title: 'Verification email sent!',
          description: 'Please check your inbox and click the verification link.',
        });
      } else {
        throw new Error(response.data?.message || 'Failed to send verification email');
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);

      toast({
        title: 'Error',
        description: err.response?.data?.message || err.message || 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCloseModal = () => {
    setVerificationSent(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <Mail className="h-5 w-5 text-primary" />
            <span>Resend Verification Email</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter your email address to receive a new verification link.
          </DialogDescription>
        </DialogHeader>

        {!verificationSent ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleResendVerification)} className="space-y-4 mt-4">
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
                        disabled={isResending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 flex flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleCloseModal}
                  disabled={isResending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-shadow duration-300"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Verification Email Sent!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your inbox and click the verification link to activate your account.
            </p>
            <DialogFooter>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-shadow duration-300"
                  onClick={handleCloseModal}
>
                    Close
              </Button>

            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
