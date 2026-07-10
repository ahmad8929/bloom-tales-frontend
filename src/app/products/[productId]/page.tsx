'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCart } from '@/hooks/useCart';
import { productApi, cartApi } from '@/lib/api';
import { ShoppingCart, Share2 } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { CartQuantityControls } from '@/components/CartQuantityControls';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { ProductDetailError } from '@/components/product/ProductDetailError';
import { ProductBadges } from '@/components/product/ProductBadges';
import { ProductPricing } from '@/components/product/ProductPricing';
import { ProductColorsDisplay } from '@/components/product/ProductColorsDisplay';
import { MaterialSelector } from '@/components/product/MaterialSelector';
import { SizeSelector } from '@/components/product/SizeSelector';
import { parseCareInstructions } from '@/components/product/CareInstructions';
import { ProductTrustBadges } from '@/components/product/ProductTrustBadges';
import { ProductStory } from '@/components/product/ProductStory';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { StickyAddToCart } from '@/components/product/StickyAddToCart';
import { WishlistButton } from '@/components/WishlistButton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getDiscountPercentage } from '@/lib/format';
import type { Product } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cartItems: reduxCartItems, removeFromCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | undefined>();
  const [cartQuantity, setCartQuantity] = useState(1);

  const productId = params.productId as string;

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await productApi.getProduct(id);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Handle the API response structure with safe type checking
      let productData = null;

      // Check for nested data structure: { data: { data: { product: {...} } } }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const nestedData = (response.data as any).data;
        if (nestedData && typeof nestedData === 'object' && 'product' in nestedData) {
          productData = nestedData.product;
        }
      }
      // Check for direct product in response.data: { data: { product: {...} } }
      else if (response.data && typeof response.data === 'object' && 'product' in (response.data as any)) {
        productData = (response.data as any).product;
      }
      // Check if product data is directly in response.data
      else if (response.data && typeof response.data === 'object') {
        productData = response.data;
      }

      if (!productData) {
        setError('Product not found');
        return;
      }

      setProduct(productData);

      // Set default size from variants or legacy fields
      try {
        if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
          const firstAvailableVariant =
            productData.variants.find((v: any) => v && (v.stock === undefined || v.stock > 0)) ||
            productData.variants[0];
          if (firstAvailableVariant && firstAvailableVariant.size) {
            setSelectedSize(firstAvailableVariant.size);
          }
        } else if (productData.size) {
          setSelectedSize(productData.size);
        } else {
          setSelectedSize('');
        }
      } catch (error) {
        console.error('Error setting initial variant state:', error);
        setSelectedSize(productData.size || '');
      }

      // Set default material to first material tag if available
      if (productData.materials && Array.isArray(productData.materials) && productData.materials.length > 0) {
        setSelectedMaterial(productData.materials[0]);
      } else {
        setSelectedMaterial('');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in cart - MUST be before early returns
  useEffect(() => {
    if (!product) {
      setIsInCart(false);
      return;
    }

    // Material to compare against — selected, or the product's first material
    const materialToCheck =
      selectedMaterial && selectedMaterial.trim()
        ? selectedMaterial
        : product?.materials && Array.isArray(product.materials) && product.materials.length > 0
          ? product.materials[0]
          : '';

    const matchesSelection = (item: any, guest: boolean) => {
      try {
        if (!item || !item.product) return false;
        const sameProduct = guest
          ? item.product.id === productId || item.product._id === productId
          : item.productId === productId || item.product?._id === productId;
        const sameSize = guest
          ? item.size === selectedSize || (!selectedSize && (item.size === product?.size || item.product.size === product?.size))
          : item.size === selectedSize || (!selectedSize && item.size === product?.size);
        const itemMaterial = item.material || '';
        const sameMaterial = materialToCheck
          ? itemMaterial === materialToCheck
          : !itemMaterial || itemMaterial === '';
        return sameProduct && sameSize && sameMaterial;
      } catch (error) {
        console.error('Error checking cart item:', error);
        return false;
      }
    };

    const applyCartItem = (cartItem: any, guest: boolean) => {
      if (cartItem && (guest || cartItem._id)) {
        setIsInCart(true);
        setCartItemId(guest ? undefined : cartItem._id);
        setCartQuantity(cartItem.quantity);
      } else {
        setIsInCart(false);
        setCartItemId(undefined);
        setCartQuantity(1);
      }
    };

    const checkCart = () => {
      if (isAuthenticated) {
        // For authenticated users, check server cart
        cartApi
          .getCart()
          .then((response) => {
            const items = response.data?.data?.cart?.items;
            if (items) {
              applyCartItem(items.find((item: any) => matchesSelection(item, false)), false);
            }
          })
          .catch((error) => {
            console.log('Cart check failed:', error);
            setIsInCart(false);
          });
      } else {
        // For guest users, check Redux cart state
        if (reduxCartItems && reduxCartItems.length > 0) {
          applyCartItem(reduxCartItems.find((item: any) => matchesSelection(item, true)), true);
        } else {
          applyCartItem(null, true);
        }
      }
    };

    checkCart();

    // Listen for cart updates
    window.addEventListener('cartUpdated', checkCart);
    return () => window.removeEventListener('cartUpdated', checkCart);
  }, [productId, isAuthenticated, product, selectedSize, selectedMaterial, reduxCartItems]);

  const handleAddToCartSuccess = () => {
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { action: 'add', productId }
    }));
  };

  // Update cart check when material changes
  useEffect(() => {
    if (product && product.materials && Array.isArray(product.materials) && product.materials.length > 0) {
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { action: 'check', productId }
      }));
    }
  }, [selectedMaterial, productId, product]);

  const handleShare = async () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/products/${productId}`;
    const shareText = `Check out ${product.name} on Bloom Tales!`;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: shareText, url: productUrl });
      } else {
        await navigator.clipboard.writeText(productUrl);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(productUrl);
        } catch {
          // Silent fail - no toast notification
        }
      }
    }
  };

  // Preferred material — explicit choice first, then product's first material
  const resolveMaterial = () =>
    selectedMaterial && selectedMaterial.trim()
      ? selectedMaterial
      : product?.materials && Array.isArray(product.materials) && product.materials.length > 0
        ? product.materials[0]
        : undefined;

  const handleBuyNow = async (material?: string) => {
    try {
      if (!isAuthenticated) {
        router.push(`/login?returnUrl=${encodeURIComponent('/checkout')}&buyNow=true`);
        return;
      }

      if (!product) {
        throw new Error('Product not found');
      }

      // Clear cart first to ensure only this product is in checkout
      await cartApi.clearCart();

      const sizeToUse = selectedSize || product?.size || 'L';

      // Check stock for selected/default size
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants.find((v: any) => v?.size === sizeToUse);
        const stock = variant ? variant.stock ?? 0 : 0;
        if (stock === 0) {
          throw new Error(`Size ${sizeToUse} is out of stock`);
        }
      } else if (currentStock !== null && currentStock === 0) {
        throw new Error('Product is out of stock');
      }

      const productIdToAdd = product._id || product.id;
      if (!productIdToAdd) {
        throw new Error('Product ID is required');
      }

      const response = await cartApi.addToCart(
        productIdToAdd,
        cartQuantity || 1,
        sizeToUse,
        product?.color || undefined,
        material || resolveMaterial()
      );

      if (response.error) {
        throw new Error(response.error);
      }

      router.push('/checkout');
    } catch (error: any) {
      console.error('Error in Buy Now:', error);

      const errorMessage = error.message || 'Failed to proceed to checkout';
      if (errorMessage.includes('Authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
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

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return <ProductDetailError message={error} onRetry={() => fetchProduct(productId)} />;
  }

  if (!product) {
    return <ProductDetailError />;
  }

  const careInstructions = parseCareInstructions(product.careInstructions);

  const discountPercentage = getDiscountPercentage(product.price, product.comparePrice);
  const savings = discountPercentage > 0 && product.comparePrice ? product.comparePrice - product.price : 0;

  // Format images for gallery
  const imageUrls = product.images?.map((img: any) =>
    typeof img === 'string' ? img : img.url
  ) || ['/placeholder-product.jpg'];

  // Compute available sizes from variants (falls back to legacy size field)
  const availableSizes = (() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const sizes = new Set<string>();
      product.variants.forEach((v: any) => {
        if (v && v.size && (v.stock === undefined || v.stock > 0)) {
          sizes.add(v.size);
        }
      });
      return Array.from(sizes).sort();
    }
    return product.size ? [product.size] : [];
  })();

  const currentStock = (() => {
    if (!selectedSize) return null;
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => v && v.size === selectedSize);
      return variant ? variant.stock ?? 0 : 0;
    }
    return null;
  })();

  const outOfStock = currentStock !== null && currentStock === 0;

  // The cart entry matching the current material+size selection, if any
  const currentMaterialInCart =
    product.materials && Array.isArray(product.materials) && product.materials.length > 0
      ? reduxCartItems?.find((item: any) => {
          const itemProductId = item.product?._id || item.product?.id || item.productId;
          const itemSize = item.size || product.size || 'L';
          const itemMaterial = item.material || '';
          return (
            itemProductId === productId &&
            itemSize === (selectedSize || product.size || 'L') &&
            itemMaterial === (selectedMaterial || '')
          );
        })
      : isInCart
        ? { quantity: cartQuantity, _id: cartItemId }
        : null;

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxe text-text-muted">
        <button onClick={() => router.push('/')} className="transition-colors hover:text-gold">
          Home
        </button>
        <span className="text-border">/</span>
        <button onClick={() => router.push('/products')} className="transition-colors hover:text-gold">
          Collection
        </button>
        <span className="text-border">/</span>
        <span className="truncate text-heading">{product.name}</span>
      </nav>

      <div className="mb-20 grid items-start gap-10 md:grid-cols-2 lg:gap-16">
        {/* Product Images */}
        <div className="w-full md:sticky md:top-28">
          <ProductImageGallery
            imageUrls={imageUrls}
            productName={product.name}
            videoUrl={product.video}
          />
        </div>

        {/* Product Details */}
        <div className="animate-fade-up space-y-8">
          <ProductBadges product={product} discountPercentage={discountPercentage} />

          {/* Product Name & Description */}
          <div>
            <h1 className="mb-4 font-display text-4xl font-medium leading-tight md:text-5xl">{product.name}</h1>
            {product.description && (
              <p className="max-w-lg leading-relaxed text-text-muted">{product.description}</p>
            )}
          </div>

          <ProductPricing product={product} savings={savings} />

          <div className="space-y-4">
            <ProductColorsDisplay product={product} />

            {product.materials && Array.isArray(product.materials) && (
              <MaterialSelector
                materials={product.materials}
                selectedMaterial={selectedMaterial}
                onSelect={setSelectedMaterial}
                productId={productId}
                productSize={product.size}
                selectedSize={selectedSize}
                cartItems={reduxCartItems as any}
              />
            )}

            {availableSizes.length > 0 && (
              <SizeSelector product={product} selectedSize={selectedSize} onSelect={setSelectedSize} />
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {currentMaterialInCart ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <CartQuantityControls
                    productId={productId}
                    initialQuantity={currentMaterialInCart.quantity || 1}
                    cartItemId={
                      typeof (currentMaterialInCart as any)._id === 'string'
                        ? (currentMaterialInCart as any)._id
                        : typeof (currentMaterialInCart as any).id === 'string'
                          ? (currentMaterialInCart as any).id
                          : cartItemId
                    }
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
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleBuyNow(selectedMaterial)}
                    disabled={outOfStock}
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="shrink-0"
                    title="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <AddToCartButton
                  product={product}
                  quantity={1}
                  material={resolveMaterial()}
                  size={selectedSize || product.size || 'L'}
                  color={product.color || undefined}
                  className="flex-1"
                  onSuccess={handleAddToCartSuccess}
                  disabled={outOfStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </AddToCartButton>

                <Button
                  className="flex-1"
                  onClick={() => handleBuyNow(resolveMaterial())}
                  disabled={outOfStock}
                >
                  Buy Now
                </Button>

                <WishlistButton
                  productId={productId}
                  className="h-11 w-11 shrink-0 border border-sage bg-transparent hover:bg-transparent"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="shrink-0"
                  title="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <ProductTrustBadges />
        </div>
      </div>

      {/* Product storytelling */}
      <div className="border-t border-border py-16 md:py-20">
        <ProductStory product={product} careInstructions={careInstructions} />
      </div>

      {/* Related products */}
      <RelatedProducts />

      {/* Mobile sticky purchase bar */}
      <StickyAddToCart
        product={product}
        size={selectedSize || product.size || 'L'}
        material={resolveMaterial()}
        disabled={outOfStock}
        onBuyNow={() => handleBuyNow(resolveMaterial())}
        onAddSuccess={handleAddToCartSuccess}
      />
    </div>
  );
}
