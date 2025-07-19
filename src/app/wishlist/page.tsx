import { WishlistView } from "@/components/WishlistView";
import { Heart } from "lucide-react";
import { Suspense } from "react";

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
         <Heart className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Wishlist</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your favorite items, all in one place.</p>
      </div>
      <Suspense fallback={<p>Loading wishlist...</p>}>
        <WishlistView />
      </Suspense>
    </div>
  );
}
