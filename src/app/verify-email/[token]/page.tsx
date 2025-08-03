'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

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
  const [message, setMessage] = useState('Verifying your email...');
  const [token, setToken] = useState<string | null>(null);

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
        const { data } = await api.get<VerifyEmailResponse>(`/auth/verify-email/${token}`);
        if (data?.status === 'success') {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data?.message || 'Failed to verify email. The link may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. The link may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token, router]);

  if (!token) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
          <div className="animate-pulse">
            <p>Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-pulse">
              <p>{message}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="text-green-600">
              <p>{message}</p>
              <p className="mt-2 text-sm">Redirecting to login page...</p>
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-600">
              <p>{message}</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}