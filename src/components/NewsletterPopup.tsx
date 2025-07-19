'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup only if it hasn't been closed this session
    const isClosedThisSession = sessionStorage.getItem('newsletterPopupClosed');
    if (!isClosedThisSession) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('newsletterPopupClosed', 'true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Add subscription logic here
    handleClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="relative w-full max-w-md">
        <button onClick={handleClose} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Join Our Community</CardTitle>
          <CardDescription>Subscribe to get 10% off your first order and stay up-to-date with our latest collections.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <Input type="email" placeholder="Enter your email" required />
            <Button type="submit">Subscribe</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
