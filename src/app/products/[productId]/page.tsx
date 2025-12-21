'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { productApi, cartApi } from "@/lib/api";
import { IndianRupee, ShoppingCart, Star, Package, Truck, Shield, RotateCcw, Loader2, Heart } from "lucide-react";
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

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt?: string }>;
  size: string;
  material: string;
  isNewArrival: boolean;
  isSale: boolean;
  slug: string;
  createdAt?: string;
  description?: string;
  careInstructions?: string | string[];
  status?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isWishlisted, setIsWishlisted] = useState(false);
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
    setSelectedSize(productData.size); // Set default size
  } catch (error: any) {
    console.error('Error fetching product:', error);
    setError(error.message || 'Failed to load product');
  } finally {
    setLoading(false);
  }
};

  // Check if product is in cart
  useEffect(() => {
    if (!isAuthenticated || !product) {
      setIsInCart(false);
      return;
    }

    const checkCart = async () => {
      try {
        const response = await cartApi.getCart();
        if (response.data?.data?.cart?.items) {
          const cartItem = response.data.data.cart.items.find(
            (item: any) => (item.productId === productId || item.product._id === productId) &&
                           (item.size === selectedSize || item.size === product.size)
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
        }
      } catch (error) {
        console.log('Cart check failed:', error);
        setIsInCart(false);
      }
    };

    checkCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (isAuthenticated) {
        checkCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [productId, isAuthenticated, product, selectedSize]);

  const handleAddToCartSuccess = () => {
    // Trigger cart update to refresh state
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { action: 'add', productId }
    }));
  };

  const handleBuyNow = async () => {
    try {
      // Check if product exists
      if (!product) {
        throw new Error('Product not found');
      }

      // Add to cart first if not already in cart
      if (!isInCart) {
        const productIdToAdd = product._id || product.id;
        if (!productIdToAdd) {
          throw new Error('Product ID is required');
        }

        const response = await cartApi.addToCart(
          productIdToAdd,
          cartQuantity || 1,
          selectedSize || product.size
        );

        if (response.error) {
          throw new Error(response.error);
        }
      }

      // Redirect to checkout
      router.push('/checkout');
    } catch (error: any) {
      console.error('Error in Buy Now:', error);
      // If error, still try to redirect (maybe item is already in cart)
      router.push('/checkout');
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
  const careInstructions = typeof product.careInstructions === 'string' 
    ? product.careInstructions.split('\n').filter(Boolean)
    : Array.isArray(product.careInstructions) 
    ? product.careInstructions 
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
        <div className="md:sticky md:top-4 max-w-md mx-auto md:mx-0">
          <ProductImageGallery imageUrls={imageUrls} productName={product.name} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-base">Size</Label>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {selectedSize}
                </Badge>
              </div>
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
                  {careInstructions.map((instruction: string, index: number) => (
                    <li key={index} className="text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {instruction.trim()}
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
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <AddToCartButton 
                  product={product} 
                  quantity={1}
                  size={selectedSize || product.size}
                  className="flex-1"
                  onSuccess={handleAddToCartSuccess}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> 
                  Add to Cart
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
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="shrink-0"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-primary" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span>Easy Returns</span>
            </div>
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
      <div className="mb-16">
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
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Size:</dt>
                    <dd className="font-medium">{product.size}</dd>
                  </div>
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
      </div>

      <Separator className="my-16" />

      {/* New Arrivals Section */}
      <div className="mb-8">
        <NewArrival limit={4} showViewAll={false} />
      </div>

      <Separator className="my-16" />

      {/* Sale Section */}
      <div>
        <Sale limit={4} showViewAll={false} title="Don't Miss These Deals!" />
      </div>
    </div>
  );
}