'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductTable } from '@/components/admin/ProductTable';
import { productApi } from '@/lib/api';

export default function AdminProductsPage() {
  const handleDeleteProduct = async (id: string) => {
    try {
      await productApi.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (id: string, data: any) => {
    try {
      await productApi.updateProduct(id, data);
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
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
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