
'use client';

import { useState } from 'react';
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
import { Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const CATEGORIES = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'] as const;

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  comparePrice: z.coerce.number().positive('Compare price must be positive').optional(),
  category: z.enum(CATEGORIES),
  material: z.string().min(2, 'Material is required'),
  careInstructions: z.string().min(10, 'Care instructions are required'),
  status: z.enum(['active', 'inactive', 'draft']).default('draft'),
  featured: z.boolean().default(false),
  sizes: z.array(z.object({
    size: z.enum(SIZES),
    quantity: z.coerce.number().min(0)
  })).min(1, 'At least one size is required'),
  colors: z.array(z.object({
    name: z.string(),
    hexCode: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
  })).min(1, 'At least one color is required'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string(),
    isPrimary: z.boolean()
  })).min(1, 'At least one image is required')
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      comparePrice: initialData?.comparePrice,
      category: (initialData?.category as typeof CATEGORIES[number]) || 'Dresses',
      material: initialData?.material || '',
      careInstructions: initialData?.careInstructions?.join('\n') || '',
      status: initialData?.status || 'draft',
      featured: initialData?.featured || false,
      sizes: initialData?.sizes || [{ size: 'M', quantity: 0 }],
      colors: initialData?.colors || [{ name: 'Black', hexCode: '#000000' }],
      images: initialData?.images || []
    }
  });

  async function handleSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      await onSubmit(data);
      setIsOpen(false);
      toast({
        title: 'Success',
        description: 'Product saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add other form fields here */}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
