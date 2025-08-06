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
  Tag,
  Search,
  Filter
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
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchFilter, setSearchFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const { accessToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAllProducts();
      console.log('Products API response:', response);
      
      // Handle the API response structure
      let productsList = [];
      if (response.data?.data?.products) {
        productsList = response.data.data.products;
      } else if (response.data && 'products' in response.data) {
        productsList = (response.data as any).products;
      } else if (Array.isArray(response.data)) {
        productsList = response.data;
      }
      
      console.log('Processed products:', productsList);
      setProducts(productsList);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await fetchProducts();
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
      await fetchProducts();
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
        await fetchProducts();
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

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      // Search filter
      const matchesSearch = !searchFilter || 
        product.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchFilter.toLowerCase());
      
      // Size filter
      const matchesSize = sizeFilter === 'all' || product.size === sizeFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      return matchesSearch && matchesSize && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      // Handle different data types
      if (sortField === 'price' || sortField === 'comparePrice') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        return (aValue - bValue) * direction;
      }
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
        return (aValue - bValue) * direction;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
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

  // Get unique values for filters
  const uniqueSizes = [...new Set(products.map(p => p.size).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  const formatPrice = (price: number | string) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return (
      <ChevronDown 
        className={`ml-1 h-3 w-3 inline transition-transform ${
          sortDirection === 'desc' ? 'rotate-180' : ''
        }`} 
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 animate-pulse text-muted-foreground" />
              <span className="text-muted-foreground">Loading products...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Products
          <Badge variant="secondary" className="ml-2">
            {filteredAndSortedProducts.length}
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products by name, description, material, or category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-[100px]">
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

            {(searchFilter || categoryFilter !== 'all' || sizeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchFilter('');
                  setCategoryFilter('all');
                  setSizeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead 
                  onClick={() => toggleSort('name')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Product {getSortIcon('name')}
                </TableHead>
                <TableHead 
                  onClick={() => toggleSort('category')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Category {getSortIcon('category')}
                </TableHead>
                <TableHead 
                  onClick={() => toggleSort('size')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Size {getSortIcon('size')}
                </TableHead>
                <TableHead 
                  onClick={() => toggleSort('material')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Material {getSortIcon('material')}
                </TableHead>
                <TableHead 
                  onClick={() => toggleSort('price')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Price {getSortIcon('price')}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  onClick={() => toggleSort('createdAt')} 
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Created {getSortIcon('createdAt')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="text-lg font-medium text-muted-foreground">
                          {products.length === 0 ? 'No products yet' : 'No products match your filters'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {products.length === 0 
                            ? 'Create your first product to get started.' 
                            : 'Try adjusting your search or filter criteria.'
                          }
                        </p>
                      </div>
                      {products.length === 0 && (
                        <ProductForm onSubmit={handleCreateProduct} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProducts.map((product) => {
                  const productId = product.id || product._id;
                  return (
                    <TableRow key={productId} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="max-w-[200px]">
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-1" title={product.name}>
                            {product.name || 'Untitled Product'}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {product.category}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {product.size || 'N/A'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {product.material || 'Not specified'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {formatPrice(product.price)}
                          </p>
                          {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isNewArrival && (
                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs border-green-200">
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
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(product.createdAt)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => window.open(`/products/${productId}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" /> 
                              View Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Pencil className="mr-2 h-4 w-4" /> 
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(productId)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> 
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results info */}
        {products.length > 0 && (
          <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredAndSortedProducts.length} of {products.length} products
            </div>
            <div className="flex items-center gap-4">
              <span>
                Sort by {sortField} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
              </span>
            </div>
          </div>
        )}

        {/* Edit Product Dialog */}
        {editingProduct && (
          <ProductForm 
            key={`edit-${editingProduct.id || editingProduct._id}`}
            initialData={editingProduct} 
            onSubmit={handleEditProduct}
            isEditing={true}
          />
        )}
      </CardContent>
    </Card>
  );
}