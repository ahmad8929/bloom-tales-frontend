'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 font-medium ml-2">
        No internet connection. Some features may be unavailable.
      </AlertDescription>
    </Alert>
  );
}

