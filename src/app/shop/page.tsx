import { ShopClient } from "@/components/ShopClient";
import { products, productCategories } from "@/lib/products";
import { Suspense } from "react";

export default function ShopPage({
  searchParams,
}: {
  searchParams?: {
    category?: string;
  };
}) {
  const selectedCategory = searchParams?.category;

  // Extract all available colors and sizes for filter options
  const allColors = [...new Set(products.map(p => p.material.split(" ")[0]))]; // Simple color extraction
  const allSizes = [...new Set(products.flatMap(p => p.availableSizes))];


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Discover pieces you'll love, for every story and every style.</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopClient 
          products={products} 
          categories={productCategories} 
          initialCategory={selectedCategory}
          allColors={allColors}
          allSizes={allSizes}
        />
      </Suspense>
    </div>
  );
}
