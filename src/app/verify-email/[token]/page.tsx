'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface VerifyEmailResponse {
  status: 'success' | 'error';
  message: string;
}

export default function VerifyEmail({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  const [token, setToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };
    
    getParams();
  }, [params]);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        console.log('Verifying email with token:', token);
        const { data, error } = await api.get<VerifyEmailResponse>(`/auth/verify-email/${token}`);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data?.status === 'success') {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully!');
          
          toast({
            title: 'Email Verified!',
            description: 'Your account is now active. You can log in to continue.',
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
          throw new Error(data?.message || 'Verification failed');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may be invalid or expired.');
        
        toast({
          title: 'Verification Failed',
          description: 'The verification link is invalid or has expired.',
          variant: 'destructive',
        });
      }
    };

    // Add a small delay to show loading state
    const timer = setTimeout(verifyEmail, 1000);
    return () => clearTimeout(timer);
  }, [token, router]);

  if (!token) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Mail className="h-6 w-6 text-primary" />
              <span>Email Verification</span>
            </CardTitle>
            <CardDescription>
              Processing verification request
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
            <Mail className="h-6 w-6 text-primary" />
            <span>Email Verification</span>
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address'}
            {status === 'success' && 'Verification completed successfully'}
            {status === 'error' && 'Verification failed'}
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
                  The verification link may have expired or is invalid.
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
                    You can request a new verification link from the login page
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