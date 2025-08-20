'use client';

import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, CheckCircle, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

type ModalStep = 'email' | 'otp' | 'password' | 'success';

export function ResetPasswordModal({ 
  open, 
  onOpenChange, 
  defaultEmail = '' 
}: ResetPasswordModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('email');
  const [userEmail, setUserEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Update email form when defaultEmail changes
  React.useEffect(() => {
    emailForm.setValue('email', defaultEmail);
  }, [defaultEmail, emailForm]);

  const handleSendOTP = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.sendResetOTP(data);
      
      if (response.data?.status === 'success') {
        setUserEmail(data.email);
        setCurrentStep('otp');
        
        toast({
          title: 'OTP sent!',
          description: 'Please check your email for the 6-digit verification code.',
        });
      } else {
        throw new Error(response.data?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      
      let errorMessage = 'Failed to send OTP';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Failed to send OTP',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyResetOTP({
        email: userEmail,
        otp: data.otp,
      });
      
      if (response.data?.status === 'success') {
        setResetToken(response.data.data.resetToken);
        setCurrentStep('password');
        
        toast({
          title: 'OTP verified!',
          description: 'Please enter your new password.',
        });
      } else {
        throw new Error(response.data?.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      
      let errorMessage = 'Invalid or expired OTP';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'OTP verification failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.resetPasswordWithToken({
        resetToken,
        password: data.password,
      });
      
      if (response.data?.status === 'success') {
        setCurrentStep('success');
        
        toast({
          title: 'Password reset successful!',
          description: 'You can now log in with your new password.',
        });
      } else {
        throw new Error(response.data?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      let errorMessage = 'Failed to reset password';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Password reset failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setCurrentStep('email');
    setUserEmail('');
    setResetToken('');
    emailForm.reset();
    otpForm.reset();
    passwordForm.reset();
    onOpenChange(false);
  };

  const goBackToEmail = () => {
    setCurrentStep('email');
    otpForm.reset();
  };

  const goBackToOTP = () => {
    setCurrentStep('otp');
    passwordForm.reset();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Reset Your Password';
      case 'otp':
        return 'Verify OTP';
      case 'password':
        return 'Set New Password';
      case 'success':
        return 'Password Reset Successful';
      default:
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return 'Enter your email address and we\'ll send you a verification code.';
      case 'otp':
        return `Enter the 6-digit code sent to ${userEmail}`;
      case 'password':
        return 'Create a strong new password for your account.';
      case 'success':
        return 'Your password has been reset successfully.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Email Input */}
        {currentStep === 'email' && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
              <FormField
                control={emailForm.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="font-medium mb-1">What happens next:</p>
                <ul className="space-y-1">
                  <li>• We'll send a 6-digit OTP to your email</li>
                  <li>• Enter the OTP to verify your identity</li>
                  <li>• Create a new password</li>
                  <li>• The OTP expires after 15 minutes</li>
                </ul>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-shadow duration-300 w-full sm:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 rounded-lg">

                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-1">
                    <p className="font-medium">Check your email:</p>
                    <p className="text-sm">{userEmail}</p>
                  </div>
                </AlertDescription>
              </Alert>

              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-Digit OTP</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        {...field}
                        disabled={isLoading}
                        className="text-center text-lg font-mono tracking-widest"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Don't see the email? Check your spam folder.</p>
                <p>The OTP will expire in 15 minutes.</p>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToEmail}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Step 3: New Password */}
        {currentStep === 'password' && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  OTP verified! Please choose a strong password with at least 8 characters.
                </AlertDescription>
              </Alert>

              <FormField
                control={passwordForm.control}
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
                control={passwordForm.control}
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

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToOTP}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            
            <DialogFooter>
              <Button onClick={handleCloseModal} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}