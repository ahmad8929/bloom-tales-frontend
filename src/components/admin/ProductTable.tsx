'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import type { Product } from '@/types/product';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  ChevronDown,
  Package,
  Star,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ProductForm } from './ProductForm';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ProductTableProps {
  onDelete?: (id: string) => Promise<void>;
  onUpdate?: (id: string, data: Partial<Product>) => Promise<void>;
}

export function ProductTable({ onDelete, onUpdate }: ProductTableProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const { accessToken } = useSelector((state: RootState) => state.auth);

  console.log(products, "products")

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProducts();
      console.log(response,"response")
      
      // Handle different response structures
      let productsList = [];
      if (response.data?.data?.products) {
        productsList = response.data.data.products;
      } else if (response.data?.products) {
        productsList = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsList = response.data;
      }
      
      setProducts(productsList);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await fetchProducts(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleEditProduct = async () => {
    try {
      await fetchProducts(); // Refresh the list
      setEditingProduct(null);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        if (onDelete) {
          await onDelete(id);
        } else {
          const response = await productApi.deleteProduct(id);
          if (response.error) {
            throw new Error(response.error);
          }
        }
        await fetchProducts(); // Refresh the list
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete product',
          variant: 'destructive',
        });
      }
    }
  };

  const sortedAndFilteredProducts = products
    .filter(product => {
      const matchesSize = sizeFilter === 'all' || product.size === sizeFilter;
      const matchesSearch = product.name?.toLowerCase().includes(filter.toLowerCase()) ||
                           product.description?.toLowerCase().includes(filter.toLowerCase()) ||
                           product.material?.toLowerCase().includes(filter.toLowerCase());
      return matchesSize && matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      return 0;
    });

  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique sizes for filter
  const uniqueSizes = Array.from(new Set(products.map(p => p.size))).filter(Boolean);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Products ({products.length})
        </CardTitle>
        <div className="flex gap-2">
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {uniqueSizes.map(size => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead onClick={() => toggleSort('name')} className="cursor-pointer">
                  Name {sortField === 'name' && <ChevronDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />}
                </TableHead>
                <TableHead onClick={() => toggleSort('size')} className="cursor-pointer">
                  Size {sortField === 'size' && <ChevronDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />}
                </TableHead>
                <TableHead onClick={() => toggleSort('material')} className="cursor-pointer">
                  Material {sortField === 'material' && <ChevronDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />}
                </TableHead>
                <TableHead onClick={() => toggleSort('price')} className="cursor-pointer">
                  Price {sortField === 'price' && <ChevronDown className={`ml-2 h-4 w-4 inline ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />}
                </TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No products found.</p>
                      <p className="text-sm text-gray-400">Create your first product to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredProducts.map((product) => (
                  <TableRow key={product.id || product._id}>
                    <TableCell>
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.size}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{product.material}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">{formatPrice(product.price)}</p>
                        {product.comparePrice && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.comparePrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.isNewArrival && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {product.isSale && (
                          <Badge variant="destructive" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            Sale
                          </Badge>
                        )}
                        {!product.isNewArrival && !product.isSale && (
                          <span className="text-xs text-gray-400">No flags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/shop/${product.slug}`, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteProduct(product.id || product._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <ProductForm 
            key={editingProduct.id || editingProduct._id} 
            initialData={editingProduct} 
            onSubmit={handleEditProduct}
            isEditing={true}
          />
        )}
      </CardContent>
    </Card>
  );
}