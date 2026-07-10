'use client';

import { ErrorState } from '@/components/ErrorState';

interface ProductDetailErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ProductDetailError({ message, onRetry }: ProductDetailErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorState
        title="Product Not Found"
        message={message || "The product you're looking for doesn't exist."}
        onRetry={onRetry}
        secondaryAction={{ label: 'Back to Products', href: '/products' }}
      />
    </div>
  );
}
