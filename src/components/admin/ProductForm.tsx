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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Upload, X, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { productApi } from '@/lib/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const PRODUCT_CATEGORIES = ['Saree', 'Kurti', 'Suite', 'Night Dress', 'Skirt', 'Top'] as const;

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  comparePrice: z.coerce.number().positive('Compare price must be positive').optional(),
  size: z.enum(SIZES, {
    required_error: 'Please select a size',
  }),
  material: z.string().min(2, 'Material is required'),
  category: z.enum(PRODUCT_CATEGORIES, {
    required_error: 'Please select a category',
  }),
  careInstructions: z.string().min(10, 'Care instructions are required'),
  isNewArrival: z.boolean().default(false),
  isSale: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: any; // Changed from Partial<Product> to any to match your data structure
  onSubmit: () => Promise<void>;
  isEditing?: boolean;
}

export function ProductForm({ initialData, onSubmit, isEditing = false }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      comparePrice: undefined,
      size: undefined,
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
        size: (initialData.size as typeof SIZES[number]) || undefined,
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

      // Append default colors as JSON string
      formData.append('colors', JSON.stringify([{ name: 'Default', hexCode: '#000000' }]));

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

  const resetForm = () => {
    form.reset();
    setSelectedImages([]);
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    setExistingImages([]);
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
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              <Button type="submit" disabled={isLoading}>
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