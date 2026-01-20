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
import { Badge } from '@/components/ui/badge';
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
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  comparePrice: z.coerce.number().min(0, 'Compare price cannot be negative').optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  careInstructions: z.string().optional(),
  isNewArrival: z.boolean().default(false),
  isSale: z.boolean().default(false),
  isStretched: z.boolean().default(false),
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
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hexCode: string }[]>([]);
  const [materialTags, setMaterialTags] = useState<string[]>([]);
  const [newMaterialTag, setNewMaterialTag] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      comparePrice: undefined,
      category: undefined,
      careInstructions: '',
      isNewArrival: false,
      isSale: false,
      isStretched: false,
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
        category: (initialData.category as typeof PRODUCT_CATEGORIES[number]) || undefined,
        careInstructions: Array.isArray(initialData.careInstructions) 
          ? initialData.careInstructions.join('\n') 
          : initialData.careInstructions || '',
        isNewArrival: initialData.isNewArrival || false,
        isSale: initialData.isSale || false,
        isStretched: initialData.isStretched || false,
      });

      // Set existing images for editing
      if (initialData.images) {
        const imageUrls = initialData.images.map((img: any) => 
          typeof img === 'string' ? img : img.url
        );
        setExistingImages(imageUrls);
      }

      // Set existing video for editing
      if (initialData.video) {
        setExistingVideo(initialData.video);
      }

      // Set colors for editing (support multiple colors)
      if (initialData.colors && Array.isArray(initialData.colors) && initialData.colors.length > 0) {
        // Match colors with the fixed color set
        const matchedColors = initialData.colors
          .map((color: any) => {
            const matched = PRODUCT_COLORS.find(c => 
              c.name === color.name || c.hexCode === color.hexCode
            );
            return matched || (color.name && color.hexCode ? color : null);
          })
          .filter((c: any) => c !== null);
        setSelectedColors(matchedColors);
      } else if (initialData.color) {
        // Legacy: single color support
        const matchedColor = PRODUCT_COLORS.find(c => 
          c.name === initialData.color.name || c.hexCode === initialData.color.hexCode
        );
        setSelectedColors(matchedColor ? [matchedColor] : []);
      } else {
        setSelectedColors([]);
      }

      // Set variants for editing (size + stock only)
      if (initialData.variants && Array.isArray(initialData.variants) && initialData.variants.length > 0) {
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
      } else {
        // If no variants or size, set empty array (for editing, we allow empty variants)
        setVariants([]);
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

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a video file.',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Video file must be less than 50MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  const removeExistingVideo = () => {
    setExistingVideo(null);
  };

  async function handleSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      
      // Validate that at least one image exists (existing or new)
      const totalImages = existingImages.length + selectedImages.length;
      if (totalImages === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one product image is required.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle boolean values properly
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append colors (multiple colors support)
      if (selectedColors.length > 0) {
        formData.append('colors', JSON.stringify(selectedColors));
        // Also set the first color as the primary color for backward compatibility
        formData.append('color', JSON.stringify(selectedColors[0]));
      } else {
        // No colors selected - optional field
        formData.append('colors', JSON.stringify([]));
      }

      // Append variants (size + stock only)
      // For editing, allow empty variants array; for new products, require at least one variant
      if (variants.length > 0) {
        formData.append('variants', JSON.stringify(variants));
      } else if (isEditing) {
        // When editing, send empty array if no variants
        formData.append('variants', JSON.stringify([]));
      }

      // Append material tags
      if (materialTags.length > 0) {
        formData.append('materials', JSON.stringify(materialTags));
      } else {
        formData.append('materials', JSON.stringify([]));
      }

      // Append existing images that weren't removed
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append new images
      selectedImages.forEach((image, index) => {
        formData.append('images', image, `image-${index}.${image.name.split('.').pop()}`);
      });

      // Append video if selected
      if (selectedVideo) {
        formData.append('video', selectedVideo, selectedVideo.name);
      }

      // Append existing video if not removed
      if (existingVideo && !selectedVideo) {
        formData.append('existingVideo', existingVideo);
      }

      console.log('Submitting product with form data...', {
        isEditing,
        productId: isEditing ? (initialData?.id || initialData?._id) : 'new',
        variantsCount: variants.length,
        imagesCount: totalImages
      });
      
      let response;
      if (isEditing && (initialData?.id || initialData?._id)) {
        const productId = initialData.id || initialData._id;
        console.log('Updating product:', productId);
        response = await productApi.updateProduct(productId, formData);
        console.log('Update response:', response);
      } else {
        console.log('Creating new product');
        response = await productApi.createProduct(formData);
        console.log('Create response:', response);
      }
      
      if (response.error) {
        console.error('API Error:', response.error);
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
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
    setExistingVideo(null);
    setVariants([]);
    setSelectedColors([]);
    setMaterialTags([]);
    setNewMaterialTag('');
  };

  const addMaterialTag = () => {
    const trimmed = newMaterialTag.trim();
    if (trimmed && !materialTags.includes(trimmed)) {
      setMaterialTags([...materialTags, trimmed]);
      setNewMaterialTag('');
    }
  };

  const removeMaterialTag = (index: number) => {
    setMaterialTags(materialTags.filter((_, i) => i !== index));
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
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.error('Form validation errors:', errors);
            toast({
              title: 'Validation Error',
              description: 'Please check the form for errors and try again.',
              variant: 'destructive',
            });
          })} className="space-y-4">
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
              <FormLabel>Product Images <span className="text-red-500">*</span></FormLabel>
              
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

            {/* Video Upload */}
            <div className="space-y-2">
              <FormLabel>Product Video <span className="text-gray-500 text-xs">(optional)</span></FormLabel>
              
              {/* Existing Video */}
              {existingVideo && !selectedVideo && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Video:</p>
                  <div className="relative">
                    <video
                      src={existingVideo}
                      controls
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeExistingVideo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload New Video */}
              {(!existingVideo || selectedVideo) && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="video" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {existingVideo ? 'Replace video' : 'Upload video'}
                        </span>
                        <span className="block text-sm text-gray-500">
                          MP4, MOV, AVI up to 50MB
                        </span>
                      </label>
                      <input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* New Video Preview */}
              {videoPreview && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">New Video Preview:</p>
                  <div className="relative">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
                      <Input 
                        type="text" 
                        inputMode="decimal"
                        placeholder="0.00" 
                        value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            field.onChange(value === '' ? 0 : Number(value));
                          }
                        }}
                      />
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
                    <FormLabel>Compare Price (₹) <span className="text-gray-500 text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        inputMode="decimal"
                        placeholder="0.00" 
                        value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only numbers and decimal point
                          if (value === '') {
                            field.onChange(undefined);
                          } else if (/^\d*\.?\d*$/.test(value)) {
                            const numValue = Number(value);
                            field.onChange(numValue > 0 ? numValue : undefined);
                          }
                        }}
                      />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category (optional)" />
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

              {/* Color Selection - Multiple Colors */}
              <div className="space-y-2">
                <FormLabel>Colors <span className="text-gray-500 text-xs">(optional, select multiple)</span></FormLabel>
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRODUCT_COLORS.map((color) => {
                      const isSelected = selectedColors.some(c => c.name === color.name);
                      return (
                        <div
                          key={color.name}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedColors(selectedColors.filter(c => c.name !== color.name));
                            } else {
                              setSelectedColors([...selectedColors, color]);
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <span className="text-sm truncate text-xs sm:text-sm">{color.name}</span>
                          {isSelected && (
                            <span className="ml-auto text-primary text-xs">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedColors.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedColors.length} color{selectedColors.length > 1 ? 's' : ''} selected
                  </p>
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

            {/* Material Tags */}
            <div className="space-y-2">
              <FormLabel>Material Tags <span className="text-gray-500 text-xs">(optional)</span></FormLabel>
              <p className="text-sm text-muted-foreground">
                Add material tags that customers can select when adding to cart
              </p>
              
              {/* Add Material Tag Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Cotton, Polyester, Silk"
                  value={newMaterialTag}
                  onChange={(e) => setNewMaterialTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMaterialTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMaterialTag}
                  disabled={!newMaterialTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Material Tags List */}
              {materialTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {materialTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeMaterialTag(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="careInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Instructions <span className="text-gray-500 text-xs">(optional)</span></FormLabel>
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

              <FormField
                control={form.control}
                name="isStretched"
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
                        Already Stretched
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark if this product is already stretched
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
                disabled={isLoading || (!isEditing && variants.length === 0)}
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