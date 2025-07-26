import Link from "next/link";
import Image from "next/image";
import { productCategories, products } from "@/lib/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/types/product";

export default function CategoriesPage() {
  const categoryImages: { [key: string]: string } = {};
  const defaultImage = "https://placehold.co/600x400.png";

  // Find the first product for each category to use its image
  productCategories.forEach((category) => {
    const product: Product | undefined = products.find(p => p.category === category);
    categoryImages[category] = product?.images?.[0] || defaultImage;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Our Collections</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find what you're looking for, from timeless sarees to adorable children's wear.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {productCategories.map((category) => (
          <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category}>
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
              <CardHeader className="p-0">
                  <div className="aspect-square relative">
                      <Image
                          src={categoryImages[category]}
                          alt={category}
                          fill
                          className="object-cover"
                          data-ai-hint={`${category} fashion`}
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                  </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-xl font-headline text-center">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </CardTitle>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
