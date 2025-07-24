
import { productApi } from "@/lib/api";
import { IndianRupee, ShoppingCart, Star } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SizeGuide } from "@/components/SizeGuide";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Product, Review } from "@/types/product";

async function getProduct(productId: string): Promise<Product | null> {
  const { data, error } = await productApi.getProduct(productId);
  if (error || !data?.product) {
    return null;
  }
  return data.product;
}

async function getRelatedProducts(categoryId: string, currentProductId: string): Promise<Product[]> {
  const { data } = await productApi.getProductsByCategory(categoryId);
  return (data?.products || [])
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);
}

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const product = await getProduct(params.productId);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id);

  const averageRating = product.reviews && product.reviews.length > 0 
    ? product.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <ProductImageGallery imageUrls={product.imageUrls} productName={product.name} />
        <div className="space-y-6">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">{product.name}</h1>
            <p className="text-lg text-muted-foreground mt-2">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({product.reviews?.length || 0} reviews)</span>
          </div>
          
          <div className="text-3xl font-bold flex items-center">
            <IndianRupee className="h-7 w-7 mr-1" /> {product.price.toLocaleString('en-IN')}
          </div>

          <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">Size</h3>
                    <SizeGuide />
                </div>
                <div className="flex gap-2">
                    {product.availableSizes.map((size: string) => (
                        <Button key={size} variant="outline" size="sm" className="w-16">{size}</Button>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="font-semibold text-lg">Details</h3>
                 <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li><span className="font-semibold text-foreground">Material:</span> {product.material}</li>
                    <li><span className="font-semibold text-foreground">Care:</span> {product.careInstructions}</li>
                 </ul>
            </div>
          </div>
          
          <div className="flex gap-4">
            <AddToCartButton product={product} size="lg" className="flex-1">
              <ShoppingCart className="mr-2" /> Add to Cart
            </AddToCartButton>
            <Button size="lg" variant="default" className="flex-1">
              Buy Now
            </Button>
          </div>
        </div>
      </div>

       <div className="mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Customer Reviews</CardTitle>
            <CardDescription>See what our customers are saying about this product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review: Review) => (
                <div key={review.id} className="flex gap-4">
                    <Avatar>
                        <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-bold">{review.user.name}</p>
                            <div className="flex">
                                {[...Array(5)].map((_, s) => <Star key={s} className={`h-4 w-4 ${s < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />)}
                            </div>
                        </div>
                        <p className="text-muted-foreground mt-2">{review.comment}</p>
                    </div>
                </div>
              ))
            ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
            <Separator />
            <Button>Write a review</Button>
          </CardContent>
        </Card>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-24">
           <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// This function tells Next.js which dynamic routes to pre-render at build time.
export async function generateStaticParams() {
  const { data } = await productApi.getAllProducts();
  return (data?.products || []).map((product) => ({
    productId: product.id,
  }));
}
