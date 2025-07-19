'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ClothingItem, OutfitRecommendation } from '@/ai/flows/ai-style-recommendation';
import { getAIStyleRecommendationsAction } from '@/app/ai-stylist/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';

const clothingCategories = ['top', 'bottom', 'dress', 'shoes', 'accessory'] as const;

const formSchema = z.object({
  style: z.string().min(1, 'Please select a style.'),
  colorPreferences: z.array(z.string()).min(1, 'Please select at least one color.'),
  size: z.string().min(1, 'Please select a size.'),
  budget: z.coerce.number().min(500, 'Budget must be at least ₹500.'),
  occasion: z.string().min(3, 'Please specify an occasion.'),
  dislikedCategories: z.array(z.enum(clothingCategories)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AIStylistClientProps {
  availableClothing: ClothingItem[];
}

const colors = ["Red", "Blue", "Green", "Black", "White", "Pink", "Yellow", "Pastel"];
const styles = ["Casual", "Formal", "Bohemian", "Party", "Ethnic", "Minimalist"];
const sizes = ["XS", "S", "M", "L", "XL"];

export function AIStylistClient({ availableClothing }: AIStylistClientProps) {
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      style: '',
      colorPreferences: [],
      size: '',
      budget: 2000,
      occasion: '',
      dislikedCategories: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const result = await getAIStyleRecommendationsAction({
        userPreferences: values,
        availableClothing,
      });
      const appropriateRecs = result.recommendations.filter(rec => rec.isAppropriate);
      setRecommendations(appropriateRecs);
    } catch (e) {
      setError('Sorry, we couldn\'t generate recommendations at this time. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Style Profile</CardTitle>
            <CardDescription>Fill out your preferences below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your style" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {styles.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occasion</FormLabel>
                      <FormControl><Input placeholder="e.g., Birthday Party, Office Meeting" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colorPreferences"
                  render={() => (
                     <FormItem>
                       <FormLabel>Favorite Colors</FormLabel>
                       <div className="grid grid-cols-2 gap-2">
                        {colors.map((color) => (
                            <FormField
                            key={color}
                            control={form.control}
                            name="colorPreferences"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(color)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...field.value, color])
                                        : field.onChange(field.value?.filter((value) => value !== color));
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{color}</FormLabel>
                                </FormItem>
                            )}
                            />
                        ))}
                       </div>
                       <FormMessage />
                     </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your size" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (INR)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Recommendations
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Finding the perfect outfits for you...</p>
            </div>
          </div>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {recommendations && (
          <div className="space-y-8">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="font-headline">Outfit Recommendation #{index + 1}</CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {rec.items.map(item => <ProductCard key={item.id} product={item} />)}
                    </div>
                    <p className="text-right font-bold mt-4">Total: ₹{rec.totalPrice.toLocaleString('en-IN')}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">We couldn't find any outfits that match your exact criteria. Please try adjusting your preferences.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {!isLoading && !recommendations && (
           <Card className="flex items-center justify-center h-full min-h-[300px] bg-secondary/30 border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">Your outfit recommendations will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
