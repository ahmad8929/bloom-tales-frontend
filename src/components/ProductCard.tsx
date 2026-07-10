'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCart } from '@/hooks/useCart';
import { AddToCartButton } from './AddToCartButton';
import { CartQuantityControls } from './CartQuantityControls';
import { Button } from '@/components/ui/button';
import { memo, useState, useEffect } from 'react';
import { Share2, Eye } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatPrice, getImageUrl, getDiscountPercentage, PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/format';
import { TiltCard } from '@/components/motion/primitives';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductQuickView } from '@/components/ProductQuickView';

interface ProductCardProps {
  product: any; // Using any to match your current API structure
  cartItems?: Array<{
    _id: string;
    productId: string;
    product: { _id: string };
    quantity: number;
  }>;
}

function ProductCardInner({ product, cartItems }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cartItems: reduxCartItems, removeFromCart } = useCart();
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | undefined>();
  const [cartQuantity, setCartQuantity] = useState(1);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const images = product.images || [];
  const mainImage = images.length > 0 ? getImageUrl(images[0]) : PLACEHOLDER_PRODUCT_IMAGE;
  const hoverImage = images.length > 1 ? getImageUrl(images[1]) : null;

  const discountPercentage = getDiscountPercentage(product.price, product.comparePrice);
  const hasDiscount = discountPercentage > 0;

  // Create link to product detail page
  const productId = product._id || product.id;

  // Check if product is in cart using provided cartItems or Redux state
  useEffect(() => {
    if (isAuthenticated) {
      // For authenticated users, use provided cartItems
      if (!cartItems) {
        setIsInCart(false);
        return;
      }

      const cartItem = cartItems.find(
        (item: any) => item && item.product && (item.productId === productId || item.product._id === productId)
      );

      if (cartItem && cartItem._id) {
        setIsInCart(true);
        setCartItemId(cartItem._id);
        setCartQuantity(cartItem.quantity);
      } else {
        setIsInCart(false);
        setCartItemId(undefined);
        setCartQuantity(1);
      }
    } else {
      // For guest users, check Redux cart state
      if (reduxCartItems && reduxCartItems.length > 0) {
        const cartItem = reduxCartItems.find(
          (item: any) => item.product.id === productId || item.product._id === productId
        );

        if (cartItem) {
          setIsInCart(true);
          setCartItemId(undefined); // No cartItemId for guest items
          setCartQuantity(cartItem.quantity);
        } else {
          setIsInCart(false);
          setCartItemId(undefined);
          setCartQuantity(1);
        }
      } else {
        setIsInCart(false);
        setCartItemId(undefined);
        setCartQuantity(1);
      }
    }
  }, [productId, cartItems, isAuthenticated, reduxCartItems]);

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
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push(`/login?returnUrl=${encodeURIComponent('/checkout')}&buyNow=true`);
        return;
      }

      // Clear cart first to ensure only this product is in checkout
      await cartApi.clearCart();

      // Add product to cart with default size "L" if no size specified
      const sizeToUse = product.size || 'L';
      const response = await cartApi.addToCart(
        productId,
        1,
        sizeToUse
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error('Error in Buy Now:', error);

      const errorMessage = error.message || error.error || 'Failed to proceed with Buy Now';
      if (errorMessage.includes('Authentication') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
        router.push(`/login?returnUrl=${encodeURIComponent('/checkout')}&buyNow=true`);
        return;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/products/${productId}`;
    const shareText = `Check out ${product.name} on Bloom Tales!`;

    try {
      // Try Web Share API first (mobile devices)
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } else {
        await navigator.clipboard.writeText(productUrl);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(productUrl);
        } catch (clipboardError) {
          // Silent fail - no toast notification
        }
      }
    }
  };

  return (
    <article className="group flex h-full flex-col">
      {/* Image — subtle 3D tilt + shadow lift on hover */}
      <TiltCard max={5} className="relative overflow-hidden bg-sand shadow-sm shadow-heading/5 transition-shadow duration-500 group-hover:shadow-xl group-hover:shadow-heading/15">
        <Link href={`/products/${productId}`} className="img-zoom block">
          <div className="relative aspect-[3/4]">
            <Image
              src={mainImage}
              alt={product.name || 'Product Image'}
              fill
              className={`object-cover transition-opacity duration-700 ease-luxe ${hoverImage ? 'group-hover:opacity-0' : ''}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${product.name} — alternate view`}
                fill
                className="object-cover opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </div>
        </Link>

        {/* Badges — quiet editorial labels */}
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {product.isNewArrival && (
            <span className="bg-ivory/95 px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-luxe text-heading">
              New
            </span>
          )}
          {hasDiscount ? (
            <span className="bg-gold px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-luxe text-white">
              −{discountPercentage}%
            </span>
          ) : product.isSale ? (
            <span className="bg-gold px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-luxe text-white">
              Sale
            </span>
          ) : null}
        </div>

        {/* Hover actions — wishlist, quick view, share */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 focus-within:opacity-100">
          <WishlistButton productId={productId} />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            title="Quick view"
            aria-label="Quick view"
            className="flex h-8 w-8 items-center justify-center bg-ivory/90 text-heading transition-colors duration-300 hover:bg-ivory hover:text-gold"
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={handleShare}
            title="Share product"
            aria-label="Share product"
            className="flex h-8 w-8 items-center justify-center bg-ivory/90 text-heading transition-colors duration-300 hover:bg-ivory hover:text-gold"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Quick add — slides up on hover (desktop) */}
        {!isInCart && (
          <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full p-3 transition-transform duration-500 ease-luxe group-hover:translate-y-0 lg:block">
            <AddToCartButton
              product={product}
              className="w-full bg-ivory/95 text-heading shadow-none backdrop-blur hover:bg-gold hover:text-white"
              size_prop="sm"
              onSuccess={handleAddToCartSuccess}
            >
              Add to Bag
            </AddToCartButton>
          </div>
        )}
      </TiltCard>

      {/* Details */}
      <div className="flex flex-grow flex-col gap-1 pt-4">
        <Link
          href={`/products/${productId}`}
          className="line-clamp-2 font-display text-[15px] leading-snug text-heading transition-colors hover:text-gold md:text-base"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-sm font-semibold text-gold">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-xs text-text-muted line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>

      {/* Cart controls */}
      <div className="pt-3">
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
              onRemove={async () => {
                await removeFromCart(productId);
                setIsInCart(false);
                setCartQuantity(1);
                window.dispatchEvent(new CustomEvent('cartUpdated', {
                  detail: { action: 'remove', productId }
                }));
              }}
            />
            <Button className="w-full" size="sm" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {/* Mobile/tablet add-to-bag; desktop uses the hover overlay */}
            <div className="lg:hidden">
              <AddToCartButton
                product={product}
                className="w-full"
                size_prop="sm"
                onSuccess={handleAddToCartSuccess}
              >
                Add to Bag
              </AddToCartButton>
            </div>
            <Button
              className="w-full"
              size="sm"
              variant="secondary"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
        )}
      </div>

      {/* Quick view dialog */}
      <ProductQuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </article>
  );
}

// Memoized — product grids re-render often (cart updates, filters) while
// individual card props rarely change.
export const ProductCard = memo(ProductCardInner);
