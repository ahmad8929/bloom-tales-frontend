'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateCartItemLocal } from '@/store/slices/cartSlice';
import { useCart } from '@/hooks/useCart';
import { productApi, cartApi } from "@/lib/api";
import { IndianRupee, ShoppingCart, Star, Package, Truck, Shield, RotateCcw, Loader2, Share2, Maximize2 } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartQuantityControls } from "@/components/CartQuantityControls";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { NewArrival } from "@/components/common/newArrival";
import { Sale } from "@/components/common/sale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { PRODUCT_COLORS, PRODUCT_SIZES } from "@/lib/constants";
import type { Product } from "@/types/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cartItems: reduxCartItems, removeFromCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
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
    
    console.log('Fetching product with ID:', id);
    const response = await productApi.getProduct(id);
    console.log('Product detail API response:', response);
    
    if (response.error) {
      console.error('API Error:', response.error);
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
    
    console.log('Parsed product:', productData);
    
    if (!productData) {
      setError('Product not found');
      return;
    }
    
    setProduct(productData);
    
    // Set default size from variants or legacy fields
    try {
      if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
        const firstAvailableVariant = productData.variants.find((v: any) => v && (v.stock === undefined || v.stock > 0)) || productData.variants[0];
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

    const checkCart = () => {
      if (isAuthenticated) {
        // For authenticated users, check server cart
        const checkServerCart = async () => {
          try {
            const response = await cartApi.getCart();
            if (response.data?.data?.cart?.items) {
              const cartItem = response.data.data.cart.items.find(
                (item: any) => {
                  try {
                    if (!item || !item.product) return false;
                    const sameProduct = item.productId === productId || item.product?._id === productId;
                    const sameSize = item.size === selectedSize || (!selectedSize && item.size === product?.size);
                    return sameProduct && sameSize;
                  } catch (error) {
                    console.error('Error checking cart item:', error);
                    return false;
                  }
                }
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
            }
          } catch (error) {
            console.log('Cart check failed:', error);
            setIsInCart(false);
          }
        };
        checkServerCart();
      } else {
        // For guest users, check Redux cart state
        if (reduxCartItems && reduxCartItems.length > 0) {
          const cartItem = reduxCartItems.find(
            (item: any) => {
              try {
                const sameProduct = item.product.id === productId || item.product._id === productId;
                const sameSize = item.size === selectedSize || (!selectedSize && (item.size === product?.size || item.product.size === product?.size));
                return sameProduct && sameSize;
              } catch (error) {
                console.error('Error checking cart item:', error);
                return false;
              }
            }
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
    };

    checkCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      checkCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [productId, isAuthenticated, product, selectedSize, reduxCartItems]);

  const handleAddToCartSuccess = () => {
    // Trigger cart update to refresh state
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { action: 'add', productId }
    }));
  };

  const handleShare = async () => {
    if (!product) return;
    
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
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(productUrl);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Try fallback to clipboard if Web Share failed
        try {
          await navigator.clipboard.writeText(productUrl);
        } catch (clipboardError) {
          // Silent fail - no toast notification
        }
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Redirect to login with returnUrl pointing to checkout
        const currentPath = `/products/${productId}`;
        router.push(`/login?returnUrl=${encodeURIComponent('/checkout')}&buyNow=true`);
        return;
      }

      // Check if product exists
      if (!product) {
        throw new Error('Product not found');
      }

      // Clear cart first to ensure only this product is in checkout
      await cartApi.clearCart();

      // Use selected size or default to "L" if no size is selected
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

      // Add product to cart with default size "L" if not selected
      const productIdToAdd = product._id || product.id;
      if (!productIdToAdd) {
        throw new Error('Product ID is required');
      }

      const response = await cartApi.addToCart(
        productIdToAdd,
        cartQuantity || 1,
        sizeToUse,
        product?.color || undefined
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error('Error in Buy Now:', error);
      
      // Check if it's an authentication error
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading product...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => fetchProduct(productId)}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/products')}>
                Back to Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/products')}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Format care instructions
  // const careInstructions = typeof product.careInstructions === 'string' 
  //   ? product.careInstructions.split('\n').filter(Boolean)
  //   : Array.isArray(product.careInstructions) 
  //   ? product.careInstructions 
  //   : [];

    const careInstructions = typeof product.careInstructions === 'string'
  ? product.careInstructions
      .split(/\r?\n/)          // handles \n and \r\n
      .map(line => line.trim())
      .filter(Boolean)         // removes empty lines
  : Array.isArray(product.careInstructions)
  ? product.careInstructions
      .map(line => String(line).trim())
      .filter(Boolean)
  : [];


  // Calculate discount if compare price exists
const hasDiscount = product.comparePrice && product.comparePrice > product.price;
const discountPercentage = hasDiscount && product.comparePrice
  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
  : 0;
const savings = hasDiscount && product.comparePrice ? product.comparePrice - product.price : 0;

  // Format images for gallery
  const imageUrls = product.images?.map((img: any) => 
    typeof img === 'string' ? img : img.url
  ) || ['/placeholder-product.jpg'];

  // Compute available sizes and colors from variants
  const getAvailableSizes = () => {
    if (!product) return [];
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const sizes = new Set<string>();
      product.variants.forEach((v: any) => {
        if (v && v.size && (v.stock === undefined || v.stock > 0)) {
          sizes.add(v.size);
        }
      });
      return Array.from(sizes).sort();
    }
    // Fallback to legacy size
    return product.size ? [product.size] : [];
  };

  const getVariantStock = (size: string) => {
    if (!product || !size) return null;
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => v && v.size === size);
      return variant ? (variant.stock ?? 0) : 0;
    }
    return null;
  };

  const availableSizes = getAvailableSizes();
  const currentStock = selectedSize ? getVariantStock(selectedSize) : null;


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors">
          Home
        </button> 
        {' / '}
        <button onClick={() => router.push('/products')} className="hover:text-foreground transition-colors">
          Products
        </button> 
        {' / '}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
        {/* Product Images */}
        <div className="md:sticky md:top-4 w-full">
          <ProductImageGallery 
            imageUrls={imageUrls} 
            productName={product.name}
            videoUrl={product.video}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Badges */}
          <div className="flex gap-2">
            {product.isNewArrival && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <Star className="w-3 h-3 mr-1" />
                New Arrival
              </Badge>
            )}
            {product.isSale && (
              <Badge variant="destructive">
                <Package className="w-3 h-3 mr-1" />
                On Sale
              </Badge>
            )}
            {product.isStretched && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Maximize2 className="w-3 h-3 mr-1" />
                Already Stretched
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-sm">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Product Name & Description */}
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
            {product.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold flex items-center text-primary">
                <IndianRupee className="h-7 w-7 mr-1" /> 
                {product.price.toLocaleString('en-IN')}
              </div>
              {hasDiscount && (
                <div className="text-xl text-muted-foreground line-through">
                  ₹{product.comparePrice?.toLocaleString('en-IN')}
                </div>
              )}
            </div>
            {hasDiscount && (
              <p className="text-green-600 font-medium">
                You save ₹{savings.toLocaleString('en-IN')}!
              </p>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {/* Product Colors Display */}
            {((product.colors && product.colors.length > 0) || product.color) && (
              <div className="space-y-2">
                <Label className="font-semibold text-base">
                  {product.colors && product.colors.length > 1 ? 'Colors' : 'Color'}
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(product.colors && product.colors.length > 0 ? product.colors : product.color ? [product.color] : []).map((color: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 hover:border-primary transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <Label className="font-semibold text-base">Size</Label>
                <div className="flex flex-wrap gap-2">
               {PRODUCT_SIZES.map((size) => {
  const variant = product.variants?.find((v: any) => v?.size === size);
  const stock = variant ? variant.stock ?? 0 : 0;
  const isAvailable = stock > 0;
  const isSelected = selectedSize === size;

  return (
    <div key={size} className="relative group">
      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => isAvailable && setSelectedSize(size)}
        className={`
          px-4 py-2 rounded-md border text-sm font-medium min-w-[48px]
          transition-all
          ${
            isSelected
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-gray-300 hover:border-primary hover:bg-primary/10'
          }
          ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {size}
      </button>

      {/* Hover tooltip ONLY for out of stock */}
      {!isAvailable && (
        <span
          className="
            pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2
            whitespace-nowrap rounded bg-black px-2 py-1 text-[11px] text-white
            opacity-0 group-hover:opacity-100 transition-opacity
          "
        >
          Out of stock
        </span>
      )}
    </div>
  );
})}



                </div>
              </div>
            )}

            {/* Stock Information */}
            {/* {currentStock !== null && (
              <div className="space-y-2">
                <Label className="font-semibold text-base">Availability</Label>
                <p className={`font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentStock > 0 
                    ? `${currentStock} in stock` 
                    : 'Out of stock'}
                </p>
              </div>
            )} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-base">Material</Label>
                <p className="text-muted-foreground capitalize">{product.material}</p>
              </div>
            </div>


            {/* Care Instructions */}
           {careInstructions.length > 0 && (
  <div>
    <h3 className="font-semibold text-lg mb-2">Care Instructions</h3>
    <ul className="space-y-1">
      {careInstructions.map((instruction, index) => (
        <li
          key={index}
          className="text-muted-foreground flex items-start gap-2"
        >
          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
          {instruction}
        </li>
      ))}
    </ul>
  </div>
)}

          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {isInCart ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <CartQuantityControls
                    productId={productId}
                    initialQuantity={cartQuantity}
                    cartItemId={cartItemId}
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
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    title="Share product"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <AddToCartButton 
                  product={product} 
                  quantity={1}
                  size={selectedSize || product.size || 'L'}
                  color={product.color || undefined}
                  className="flex-1"
                  onSuccess={handleAddToCartSuccess}
                  disabled={
                    (currentStock !== null && currentStock === 0)
                  }
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> 
                  {currentStock !== null && currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </AddToCartButton>
                
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleBuyNow}
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
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            {/* <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span>Easy Returns</span>
            </div> */}
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Package className="h-5 w-5 text-primary" />
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-16" />

      {/* Product Details Section */}
      {/* <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Product Details</CardTitle>
            <CardDescription>Complete information about this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Specifications</h4>
                <dl className="space-y-2">
                  {selectedSize && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Size:</dt>
                      <dd className="font-medium">{selectedSize}</dd>
                    </div>
                  )}
                  {!selectedSize && product.size && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Size:</dt>
                      <dd className="font-medium">{product.size}</dd>
                    </div>
                  )}
                  {((product.colors && product.colors.length > 0) || product.color) && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {product.colors && product.colors.length > 1 ? 'Colors:' : 'Color:'}
                      </dt>
                      <dd className="font-medium flex items-center gap-2 flex-wrap">
                        {(product.colors && product.colors.length > 0 ? product.colors : product.color ? [product.color] : []).map((color: any, index: number) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hexCode }}
                            />
                            <span className="text-sm">{color.name}</span>
                            {index < (product.colors?.length || 1) - 1 && <span className="text-muted-foreground">,</span>}
                          </div>
                        ))}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Material:</dt>
                    <dd className="font-medium capitalize">{product.material}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">SKU:</dt>
                    <dd className="font-medium">{product._id || product.id}</dd>
                  </div>
                  {product.status && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd className="font-medium capitalize">{product.status}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {product.isNewArrival && (
                    <li className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Latest Design
                    </li>
                  )}
                  {product.isSale && (
                    <li className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Special Offer
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Premium Quality
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Comfortable Fit
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* <Separator className="my-16" /> */}

      {/* New Arrivals Section */}
      {/* <div className="mb-8">
        <NewArrival limit={4} showViewAll={false} />
      </div> */}

      {/* <Separator className="my-16" /> */}

      {/* Sale Section */}
      {/* <div>
        <Sale limit={4} showViewAll={false} title="Don't Miss These Deals!" />
      </div> */}
    </div>
  );
}