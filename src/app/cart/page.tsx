import { CartView } from "@/components/CartView";
import { Suspense } from "react";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Shopping Cart</h1>
      </div>
      <Suspense fallback={<p>Loading cart...</p>}>
        <CartView />
      </Suspense>
    </div>
  );
}
