
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/lib/products';
import { ArrowRight, Bot, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NewsletterPopup } from '@/components/NewsletterPopup';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function Home() {
  const newArrivals = products.slice(0, 4);
  const onSale = products.slice(4, 8);
  const mainCategories = ['saree', 'kurti', 'western dress', 'baby girl'];

  const categoryImages: { [key: string]: string } = {
    'saree': 'https://placehold.co/600x800.png',
    'kurti': 'https://placehold.co/600x800.png',
    'western dress': 'https://placehold.co/600x800.png',
    'baby girl': 'https://placehold.co/600x800.png'
  };

  const heroSlides = [
    {
      image: "https://placehold.co/1600x900.png",
      hint: "fashion boutique hero",
      title: "Style That Blooms",
      subtitle: "Discover curated collections that blend timeless elegance with modern trends.",
      cta: "Shop New Arrivals"
    },
    {
      image: "https://placehold.co/1600x900.png",
      hint: "summer fashion collection",
      title: "Summer Breeze Collection",
      subtitle: "Light, airy, and ready for sunshine. Explore our latest summer styles.",
      cta: "Explore Summer"
    },
    {
      image: "https://placehold.co/1600x900.png",
      hint: "kids fashion playful",
      title: "For The Little Ones",
      subtitle: "Adorable outfits for every adventure. Dress them in comfort and style.",
      cta: "Shop Kids Wear"
    }
  ];

  return (
    <div className="flex flex-col">
      <NewsletterPopup />
      
      <section className="w-full">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center text-center p-4">
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      data-ai-hint={slide.hint}
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="relative z-10 max-w-3xl mx-auto text-white">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-lg md:text-xl">
                      {slide.subtitle}
                    </p>
                    <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/shop">
                        {slide.cta} <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

       <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mainCategories.map((category) => (
              <Link href={`/shop?category=${encodeURIComponent(category)}`} key={category}>
                  <Card className="overflow-hidden group relative transition-all duration-300 hover:shadow-xl">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={categoryImages[category]}
                        alt={category}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint={`${category} fashion`}
                      />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-headline font-bold p-4 text-center bg-black/30 rounded-md transition-all duration-300 group-hover:bg-black/40">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </h3>
                    </div>
                  </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12 text-primary-foreground bg-primary p-4 rounded-lg">
            Limited Time Sale!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {onSale.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="bg-card p-8 rounded-lg shadow-lg text-center md:text-left">
              <Bot className="mx-auto md:mx-0 h-12 w-12 text-primary mb-4" />
              <h3 className="font-headline text-3xl md:text-4xl font-bold mb-4">
                Your Personal AI Stylist
              </h3>
              <p className="text-muted-foreground mb-6">
                Struggling to find the perfect outfit? Let our AI-powered tool create personalized style recommendations just for you. Find the perfect look for any occasion and budget.
              </p>
              <Button asChild>
                <Link href="/ai-stylist">
                  Try It Now <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://placehold.co/600x400.png"
                alt="AI Stylist concept"
                fill
                className="object-cover"
                data-ai-hint="style algorithm"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, s) => <Star key={s} className="h-5 w-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground mb-4">"The quality is amazing and the designs are so unique. I get compliments every time I wear my Bloomtales dress!"</p>
                  <p className="font-bold font-headline">- Priya S.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
