'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Star, Tag, Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  product: any; // Using any to match your current API structure
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Handle different image structures
  const getImageUrl = (imageData: any) => {
    if (typeof imageData === 'string') return imageData;
    if (imageData?.url) return imageData.url;
    return '/placeholder-product.jpg';
  };

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const mainImage = images.length > 0 ? getImageUrl(images[0]) : '/placeholder-product.jpg';
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
      className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg group border hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-[3/4] relative overflow-hidden">
          <Link href={`/products/${productId}`}>
            <Image
              src={isHovered && hasMultipleImages ? hoverImage : mainImage}
              alt={product.name || 'Product Image'}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          
          {/* Product Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNewArrival && (
              <Badge className="bg-green-100 text-green-800 text-xs shadow-sm">
                <Star className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            )}
            {product.isSale && (
              <Badge variant="destructive" className="text-xs shadow-sm">
                <Tag className="w-3 h-3 mr-1" />
                SALE
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive" className="text-xs font-bold shadow-sm">
                {discountPercentage}% OFF
              </Badge>
            </div>
          )}

          {/* Quick Actions - Show on Hover */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                asChild
              >
                <Link href={`/products/${productId}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Overlay for better text readability */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-base leading-tight mb-2">
          <Link 
            href={`/products/${productId}`} 
            className="hover:text-primary transition-colors line-clamp-2 font-medium"
          >
            {product.name}
          </Link>
        </CardTitle>
        
        {/* Product Details */}
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          {product.size && (
            <p>Size: <span className="font-medium text-foreground">{product.size}</span></p>
          )}
          {product.material && (
            <p className="capitalize">Material: <span className="font-medium text-foreground">{product.material}</span></p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Savings Display */}
        {hasDiscount && (
          <div className="mb-3">
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Save {formatPrice(product.comparePrice - product.price)}
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {/* Add to Cart Button */}
        <div className="w-full flex gap-2">
          <AddToCartButton 
            product={product} 
            className="flex-1" 
            onSuccess={() => {
              // Optional: Could show additional feedback or redirect
            }}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}