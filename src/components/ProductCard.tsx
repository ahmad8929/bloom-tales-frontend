'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AddToCartButton } from './AddToCartButton';
import { useState } from 'react';
import { WishlistButton } from './WishlistButton';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = product.images?.length > 1;
  const defaultImage = 'https://placehold.co/600x800.png';
  const mainImage = product.images?.[0] || defaultImage;
  const hoverImage = hasMultipleImages ? product.images[1] : mainImage;

  return (
    <Card 
      className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <Link href={`/shop/${product._id}`}>
          <div className="aspect-[3/4] relative">
            <Image
              src={isHovered ? hoverImage : mainImage}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        <WishlistButton 
          product={product}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100" 
        />
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg leading-tight">
          <Link href={`/shop/${product._id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <div className="mt-2 text-sm text-muted-foreground">
          {product.stockStatus === 'inStock' ? (
            <span className="text-green-600">In Stock</span>
          ) : product.stockStatus === 'lowStock' ? (
            <span className="text-amber-600">Low Stock</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <div className="font-semibold text-lg">
          ₹{product.price.toLocaleString('en-IN')}
        </div>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
