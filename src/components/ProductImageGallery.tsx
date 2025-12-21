'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ProductImageGalleryProps {
  imageUrls: string[];
  productName: string;
}

export function ProductImageGallery({ imageUrls, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(imageUrls[0]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
            <div className="relative aspect-[4/5] max-w-sm mx-auto">
              <Image
                src={selectedImage}
                alt={`Main image for ${productName}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                data-ai-hint="product image"
              />
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-5 gap-2">
        {imageUrls.map((url, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(url)}
            className={cn(
              "relative aspect-square rounded-md overflow-hidden transition-all",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selectedImage === url ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={url}
              alt={`Thumbnail ${index + 1} for ${productName}`}
              fill
              className="object-cover"
              sizes="20vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
