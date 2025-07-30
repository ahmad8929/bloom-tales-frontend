'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductTable } from '@/components/admin/ProductTable';
import { productApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const handleDeleteProduct = async (id: string): Promise<void> => {
    try {
      const response = await productApi.deleteProduct(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Don't return the response, just resolve void
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (id: string, data: any): Promise<void> => {
    try {
      const response = await productApi.updateProduct(id, data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Don't return the response, just resolve void
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product inventory and listings
            </p>
          </div>
        </div>
        
        <ProductTable 
          onDelete={handleDeleteProduct}
          onUpdate={handleUpdateProduct}
        />
      </div>
    </AdminLayout>
  );
}