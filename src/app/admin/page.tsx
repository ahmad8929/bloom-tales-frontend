
import { ProductTable } from "@/components/admin/ProductTable";
import { products } from "@/lib/products";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your products</p>
      </div>
      <ProductTable products={products} />
    </div>
  );
}
