import { products } from "@/lib/products";
import { AIStylistClient } from "@/components/AIStylistClient";
import { Bot } from "lucide-react";

export default function AIStylistPage() {
  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center mb-12">
        <Bot className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold">AI Personal Stylist</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us your preferences, and our AI will curate the perfect outfits for you from our collection.
        </p>
      </div>
      <AIStylistClient availableClothing={products} />
    </div>
  );
}
