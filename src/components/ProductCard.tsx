'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './AddToCartButton';
import { CartQuantityControls } from './CartQuantityControls';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Star, Tag } from 'lucide-react';
import { cartApi } from '@/lib/api';

interface ProductCardProps {
  product: any; // Using any to match your current API structure
  cartItems?: Array<{
    _id: string;
    productId: string;
    product: { _id: string };
    quantity: number;
  }>;
}

export function ProductCard({ product, cartItems }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | undefined>();
  const [cartQuantity, setCartQuantity] = useState(1);

  // Handle different image structures
  const getImageUrl = (imageData: any) => {
    if (typeof imageData === 'string') return imageData;
    if (imageData?.url) return imageData.url;
    return '/placeholder-product.jpg';
  };

  const images = product.images || [];
  const mainImage = images.length > 0 ? getImageUrl(images[0]) : '/placeholder-product.jpg';

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

  // Check if product is in cart using provided cartItems or listen for updates
  useEffect(() => {
    if (!isAuthenticated || !cartItems) {
      setIsInCart(false);
      return;
    }

    const cartItem = cartItems.find(
      (item: any) => item.productId === productId || item.product._id === productId
    );

    if (cartItem) {
      setIsInCart(true);
      setCartItemId(cartItem._id);
      setCartQuantity(cartItem.quantity);
    } else {
      setIsInCart(false);
      setCartItemId(undefined);
      setCartQuantity(1);
    }
  }, [productId, cartItems, isAuthenticated]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      // Re-check cart when it's updated
      if (isAuthenticated && event.detail?.action) {
        // Cart was updated, we'll rely on parent to pass updated cartItems
        // For now, just reset state and let parent handle it
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
  }, [isAuthenticated]);

  const handleAddToCartSuccess = () => {
    // Trigger cart update event - parent will refetch and pass new cartItems
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { action: 'add', productId }
    }));
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Add to cart first
      const response = await cartApi.addToCart(
        productId,
        1,
        product.size
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error('Error in Buy Now:', error);
      // If error, still try to redirect (maybe item is already in cart)
      router.push('/checkout');
    }
  };

  return (
<Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md group border border-border/60">

      <CardHeader className="p-0 relative">
        <div className="aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden">
          <Link href={`/products/${productId}`}>
            <Image
              src={mainImage}
              alt={product.name || 'Product Image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>
          
          {/* Product Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isNewArrival && (
              <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 mr-0.5" />
                NEW
              </Badge>
            )}
            {product.isSale && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                <Tag className="w-2.5 h-2.5 mr-0.5" />
                SALE
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="destructive" className="text-xs font-bold px-1.5 py-0.5">
                {discountPercentage}% OFF
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-2 md:p-3">
<CardTitle className="text-[13px] leading-snug mb-1 md:text-sm">

          <Link 
            href={`/products/${productId}`} 
            className="hover:text-primary transition-colors line-clamp-2 font-medium"
          >
            {product.name}
          </Link>
        </CardTitle>
        
        {/* Pricing */}
        <div className="flex items-center gap-1.5 mb-1.5">

          <span className="font-bold text-base text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-1 md:p-3 md:pt-0">

        {isInCart ? (
          <div className="w-full space-y-2">
            <CartQuantityControls
              productId={productId}
              initialQuantity={cartQuantity}
              cartItemId={cartItemId}
              className="justify-center"
              onQuantityChange={(qty) => {
                setCartQuantity(qty);
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                  detail: { action: 'update', productId, quantity: qty }
                }));
              }}
            />
            <Button
              className="w-full"
              size="sm"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <AddToCartButton 
              product={product} 
              className="w-full" 
              size_prop="sm"
              onSuccess={handleAddToCartSuccess}
            />
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}