'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface ShopClientProps {
  products: any[];
  allColors: string[];
  allSizes: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const FilterSidebar = ({ 
    allColors, 
    allSizes,
    selectedSizes,
    handleSizeChange,
    selectedColors,
    handleColorChange,
    priceRange,
    handlePriceChange
}: any) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-headline text-lg mb-4">Size</h3>
            <div className="grid grid-cols-3 gap-2">
            {allSizes.map((size: string) => (
                <div key={size} className="flex items-center gap-2">
                    <Checkbox id={`size-${size}`} checked={selectedSizes.includes(size)} onCheckedChange={() => handleSizeChange(size)} />
                    <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
            ))}
            </div>
        </div>
        <div>
            <h3 className="font-headline text-lg mb-4">Color</h3>
            <div className="space-y-2">
            {allColors.map((color: string) => (
                <div key={color} className="flex items-center gap-2">
                    <Checkbox id={`color-${color}`} checked={selectedColors.includes(color)} onCheckedChange={() => handleColorChange(color)} />
                    <Label htmlFor={`color-${color}`}>{color}</Label>
                </div>
            ))}
            </div>
        </div>
        <div>
            <h3 className="font-headline text-lg mb-4">Price Range</h3>
            <Slider
                defaultValue={[priceRange]}
                max={10000}
                step={100}
                onValueChange={(value) => handlePriceChange(value[0])}
            />
            <div className="mt-2 text-sm text-muted-foreground">Up to ₹{priceRange.toLocaleString('en-IN')}</div>
        </div>
    </div>
);

export function ShopClient({ products, allColors, allSizes }: ShopClientProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };
  
  const handleColorChange = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handlePriceChange = (value: number) => {
    setPriceRange(value);
  };
  
  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(10000);
    setSortOption('newest');
    router.push('/shop');
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    if(selectedSizes.length > 0) {
      filtered = filtered.filter(product => product.availableSizes?.some((size: string) => selectedSizes.includes(size)));
    }

    if(selectedColors.length > 0) {
      filtered = filtered.filter(product => selectedColors.some(color => product.material?.toLowerCase().includes(color.toLowerCase())));
    }
    
    filtered = filtered.filter(product => product.price <= priceRange);

    switch (sortOption) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return filtered;
    }
  }, [products, selectedSizes, selectedColors, priceRange, sortOption]);

  const activeFilterCount = selectedSizes.length + selectedColors.length + (priceRange < 10000 ? 1 : 0);

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <aside className="hidden lg:block lg:col-span-1">
        <FilterSidebar
            allColors={allColors}
            allSizes={allSizes}
            selectedSizes={selectedSizes}
            handleSizeChange={handleSizeChange}
            selectedColors={selectedColors}
            handleColorChange={handleColorChange}
            priceRange={priceRange}
            handlePriceChange={handlePriceChange}
        />
      </aside>
      
      <main className="lg:col-span-3">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className='flex items-center gap-4'>
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                            <div className="p-6">
                                <FilterSidebar
                                    allColors={allColors}
                                    allSizes={allSizes}
                                    selectedSizes={selectedSizes}
                                    handleSizeChange={handleSizeChange}
                                    selectedColors={selectedColors}
                                    handleColorChange={handleColorChange}
                                    priceRange={priceRange}
                                    handlePriceChange={handlePriceChange}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
                 {activeFilterCount > 0 && (
                  <Button variant="ghost" onClick={resetFilters} className="hidden sm:inline-flex items-center">
                    <X className="mr-2 h-4 w-4" /> Reset ({activeFilterCount})
                  </Button>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-muted-foreground whitespace-nowrap">Sort by:</Label>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-[180px]" id="sort">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-headline mb-2">No Products Found</h2>
            <p className="text-muted-foreground mb-4">Try adjusting your filters to find what you're looking for.</p>
            <Button onClick={resetFilters}>Clear All Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}