'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ClothingItem } from '@/ai/flows/ai-style-recommendation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { useState } from 'react';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: ClothingItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = product.imageUrls.length > 1;

  return (
    <Card 
      className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <Link href={`/shop/${product.id}`}>
          <div className="aspect-[3/4] relative">
            <Image
              src={(isHovered && hasMultipleImages) ? product.imageUrls[1] : product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={`${product.category || 'fashion'} clothing`}
            />
          </div>
        </Link>
        <WishlistButton 
          product={product} 
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100" 
        />
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline leading-tight">
          <Link href={`/shop/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div className="font-semibold text-lg flex items-center">
          <IndianRupee className="h-5 w-5 mr-1" /> {product.price.toLocaleString('en-IN')}
        </div>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
