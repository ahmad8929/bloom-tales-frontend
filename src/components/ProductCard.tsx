'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { useState } from 'react';
import { Star, Tag } from 'lucide-react';

interface ProductCardProps {
  product: any; // Using any to match your current API structure
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle different image structures
  const getImageUrl = (imageData: any) => {
    if (typeof imageData === 'string') return imageData;
    if (imageData?.url) return imageData.url;
    return 'https://placehold.co/600x800.png';
  };

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const mainImage = images.length > 0 ? getImageUrl(images[0]) : 'https://placehold.co/600x800.png';
  const hoverImage = hasMultipleImages ? getImageUrl(images[1]) : mainImage;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Calculate discount
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // Create link to product detail page
  const productId = product._id || product.id;
  const productSlug = product.slug || productId;

  return (
    <Card 
      className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <Link href={`/products/${productId}`}>
          <div className="aspect-[3/4] relative">
            <Image
              src={isHovered && hasMultipleImages ? hoverImage : mainImage}
              alt={product.name || 'Product Image'}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Product Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.isNewArrival && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  NEW
                </Badge>
              )}
              {product.isSale && (
                <Badge variant="destructive" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  SALE
                </Badge>
              )}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs font-bold">
                  {discountPercentage}% OFF
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg leading-tight mb-2">
          <Link 
            href={`/product/${productId}`} 
            className="hover:text-primary transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
        </CardTitle>
        
        {/* Product Details */}
        <div className="space-y-1 text-sm text-muted-foreground">
          {product.size && (
            <p>Size: <span className="font-medium">{product.size}</span></p>
          )}
          {product.material && (
            <p className="capitalize">Material: <span className="font-medium">{product.material}</span></p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex flex-col gap-3">
        {/* Pricing */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Savings Display */}
        {hasDiscount && (
          <div className="w-full text-center">
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              Save {formatPrice(product.comparePrice - product.price)}
            </span>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <div className="w-full">
          <AddToCartButton product={product} className="w-full" />
        </div>
      </CardFooter>
    </Card>
  );
}