
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClothingItem } from '@/ai/flows/ai-style-recommendation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const productCategories = ['saree', 'kurti', 'western dress', 'baby boy', 'baby girl', 'boy dress', 'girl dress', 'cuddler dress'] as const;

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  imageUrls: z.string().min(1, 'Please provide at least one image URL.').transform(value => value.split(',').map(url => url.trim()).filter(url => url)),
  category: z.enum(productCategories),
  availableSizes: z.string().min(1, 'Please enter comma-separated sizes.'),
  price: z.coerce.number().min(1, 'Price must be greater than 0.'),
  material: z.string().min(3, 'Please specify the material.'),
  careInstructions: z.string().min(5, 'Please provide care instructions.'),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrls: [],
      category: 'saree',
      availableSizes: '',
      price: 0,
      material: '',
      careInstructions: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const newProductData: Omit<ClothingItem, 'id'> = {
        ...values,
        availableSizes: values.availableSizes.split(',').map(s => s.trim()),
    };
    
    // In a real app, you would call a server action here to save the product to a database.
    // For now, we'll just simulate an API call.
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Product Submitted:", newProductData);

    toast({
        title: "Product Added (Simulated)",
        description: `${values.name} has been added to the product list.`,
    });
    
    setIsLoading(false);
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your store.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Classic Silk Saree" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="imageUrls" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URLs</FormLabel>
                   <FormControl>
                    <Input 
                      placeholder="https://placehold.co/1.png, https://placehold.co/2.png" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      // The form field expects an array, but the input provides a string.
                      // The schema handles the transform, but we cast here to satisfy TS.
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {productCategories.map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (INR)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 4999" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField control={form.control} name="availableSizes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <FormControl><Input placeholder="S, M, L, One Size (comma-separated)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl><Input placeholder="e.g., Silk Blend" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="careInstructions" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Care Instructions</FormLabel>
                      <FormControl><Input placeholder="e.g., Dry clean only" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Product
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
