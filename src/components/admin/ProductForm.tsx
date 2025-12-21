'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProductFormData } from '@/types/product';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Upload, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { productApi } from '@/lib/api';
import { PRODUCT_COLORS, PRODUCT_SIZES } from '@/lib/constants';

const SIZES = PRODUCT_SIZES;
// const PRODUCT_CATEGORIES = ['Saree', 'Kurti', 'Suite', 'Night Dress', 'Skirt', 'Top'] as const;
const PRODUCT_CATEGORIES = ['Cordset', 'Anarkali', 'Suite', 'Kurti', 'Saree', 'Lehenga', 'Western Dress'] as const;

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  comparePrice: z.coerce.number().positive('Compare price must be positive').optional(),
  material: z.string().min(2, 'Material is required'),
  category: z.enum(PRODUCT_CATEGORIES, {
    required_error: 'Please select a category',
  }),
  careInstructions: z.string().min(10, 'Care instructions are required'),
  isNewArrival: z.boolean().default(false),
  isSale: z.boolean().default(false),
  color: z.object({
    name: z.string(),
    hexCode: z.string()
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any; // Changed from Partial<Product> to any to match your data structure
  onSubmit: () => Promise<void>;
  isEditing?: boolean;
}

interface Variant {
  size: typeof SIZES[number];
  stock: number;
  sku?: string;
}

export function ProductForm({ initialData, onSubmit, isEditing = false }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hexCode: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      comparePrice: undefined,
      material: '',
      category: undefined,
      careInstructions: '',
      isNewArrival: false,
      isSale: false,
    }
  });

  // Auto-open dialog for editing
  useEffect(() => {
    if (isEditing && initialData) {
      setIsOpen(true);
    }
  }, [isEditing, initialData]);

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        comparePrice: initialData.comparePrice || undefined,
        material: initialData.material || '',
        category: (initialData.category as typeof PRODUCT_CATEGORIES[number]) || undefined,
        careInstructions: Array.isArray(initialData.careInstructions) 
          ? initialData.careInstructions.join('\n') 
          : initialData.careInstructions || '',
        isNewArrival: initialData.isNewArrival || false,
        isSale: initialData.isSale || false,
      });

      // Set existing images for editing
      if (initialData.images) {
        const imageUrls = initialData.images.map((img: any) => 
          typeof img === 'string' ? img : img.url
        );
        setExistingImages(imageUrls);
      }

      // Set color for editing
      if (initialData.color) {
        setSelectedColor(initialData.color);
      } else if (initialData.colors && initialData.colors.length > 0) {
        // Try to match with fixed color set
        const matchedColor = PRODUCT_COLORS.find(c => 
          c.name === initialData.colors[0].name || c.hexCode === initialData.colors[0].hexCode
        );
        setSelectedColor(matchedColor || null);
      }

      // Set variants for editing (size + stock only)
      if (initialData.variants && Array.isArray(initialData.variants)) {
        setVariants(initialData.variants.map((v: any) => ({
          size: v.size,
          stock: v.stock || 0,
          sku: v.sku
        })));
      } else if (initialData.size) {
        // Legacy: create a variant from old size field
        setVariants([{
          size: initialData.size,
          stock: 0,
          sku: undefined
        }]);
      }
    }
  }, [initialData, isOpen, form]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit total images (existing + new) to 5
    const totalImages = existingImages.length + selectedImages.length;
    const availableSlots = 5 - totalImages;
    const limitedFiles = files.slice(0, availableSlots);

    if (limitedFiles.length < files.length) {
      toast({
        title: 'Image Limit',
        description: 'Maximum 5 images allowed. Some images were not added.',
        variant: 'destructive',
      });
    }

    setSelectedImages(prev => [...prev, ...limitedFiles]);

    // Create preview URLs
    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append color (product-level, fixed color set)
      if (selectedColor) {
        formData.append('color', JSON.stringify(selectedColor));
      }

      // Append default colors as JSON string (for backward compatibility)
      if (selectedColor) {
        formData.append('colors', JSON.stringify([selectedColor]));
      } else {
        formData.append('colors', JSON.stringify([{ name: 'Default', hexCode: '#000000' }]));
      }

      // Append variants (size + stock only)
      if (variants.length > 0) {
        formData.append('variants', JSON.stringify(variants));
      }

      // Append existing images that weren't removed
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append new images
      selectedImages.forEach((image, index) => {
        formData.append('images', image, `image-${index}.${image.name.split('.').pop()}`);
      });

      console.log('Submitting product with form data...');
      
      let response;
      if (isEditing && (initialData?.id || initialData?._id)) {
        const productId = initialData.id || initialData._id;
        response = await productApi.updateProduct(productId, formData);
      } else {
        response = await productApi.createProduct(formData);
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      await onSubmit();
      setIsOpen(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: isEditing ? 'Product updated successfully.' : 'Product created successfully.',
      });
    } catch (error: any) {
      console.error('Product operation error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const addVariant = () => {
    // Check which sizes are already added
    const existingSizes = new Set(variants.map(v => v.size));
    const availableSize = SIZES.find(s => !existingSizes.has(s)) || 'M';
    
    setVariants([...variants, {
      size: availableSize as typeof SIZES[number],
      stock: 0,
      sku: undefined
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const resetForm = () => {
    form.reset();
    setSelectedImages([]);
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setExistingImages([]);
    setVariants([]);
    setSelectedColor(null);
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
      if (isEditing) {
        // Call onSubmit to refresh the table and close editing mode
        onSubmit();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {!isEditing && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Product Images</FormLabel>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {(existingImages.length + selectedImages.length) < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload new images
                        </span>
                        <span className="block text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB each 
                          ({5 - existingImages.length - selectedImages.length} remaining)
                        </span>
                      </label>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* New Image Previews */}
              {imagePreview.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">New Images:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreview.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comparePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Selection - Product Level */}
              <div className="space-y-2">
                <FormLabel>Color <span className="text-red-500">*</span></FormLabel>
                <Select
                  value={selectedColor?.name || ''}
                  onValueChange={(value) => {
                    const color = PRODUCT_COLORS.find(c => c.name === value);
                    setSelectedColor(color || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_COLORS.map((color) => (
                      <SelectItem key={color.name} value={color.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedColor && (
                  <p className="text-sm text-destructive">Please select a color</p>
                )}
              </div>
            </div>

            {/* Product Variants - Size and Stock Only */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="text-base font-medium">Size & Stock</FormLabel>
                  <p className="text-sm text-muted-foreground">Add multiple sizes with individual stock quantities</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  disabled={variants.length >= SIZES.length}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Size
                </Button>
              </div>
              
              {variants.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                  No sizes added. Click "Add Size" to add size-stock combinations.
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => {
                    const usedSizes = variants.map(v => v.size);
                    const availableSizes = SIZES.filter(s => s === variant.size || !usedSizes.includes(s));
                    
                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg items-center bg-gray-50">
                        <div className="col-span-4">
                          <Label className="text-xs text-muted-foreground mb-1 block">Size</Label>
                          <Select
                            value={variant.size}
                            onValueChange={(value) => updateVariant(index, 'size', value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-6">
                          <Label className="text-xs text-muted-foreground mb-1 block">Stock Quantity</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            className="h-9"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="col-span-2 flex justify-end items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(index)}
                            className="h-9 w-9 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cotton, Polyester, Silk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="careInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter care instructions (one per line)"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Flags */}
            <div className="space-y-4">
              <FormLabel className="text-base font-medium">Product Flags</FormLabel>
              
              <FormField
                control={form.control}
                name="isNewArrival"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        New Arrival
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this product as a new arrival
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        On Sale
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this product as being on sale
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedColor || variants.length === 0}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Product' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}