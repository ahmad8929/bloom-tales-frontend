'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { X, Filter, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ShopClientProps {
  products: any[];
  allMaterials: string[];
  allSizes: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const FilterSidebar = ({ 
    allMaterials, 
    allSizes,
    selectedSizes,
    handleSizeChange,
    selectedMaterials,
    handleMaterialChange,
    priceRange,
    handlePriceChange,
    isNewArrival,
    setIsNewArrival,
    isSale,
    setIsSale
}: any) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-headline text-lg mb-4">Product Flags</h3>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="new-arrival" 
                        checked={isNewArrival} 
                        onCheckedChange={setIsNewArrival} 
                    />
                    <Label htmlFor="new-arrival" className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        New Arrivals
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="on-sale" 
                        checked={isSale} 
                        onCheckedChange={setIsSale} 
                    />
                    <Label htmlFor="on-sale" className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        On Sale
                    </Label>
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-headline text-lg mb-4">Size</h3>
            <div className="grid grid-cols-3 gap-2">
                {allSizes.map((size: string) => (
                    <div key={size} className="flex items-center gap-2">
                        <Checkbox 
                            id={`size-${size}`} 
                            checked={selectedSizes.includes(size)} 
                            onCheckedChange={() => handleSizeChange(size)} 
                        />
                        <Label htmlFor={`size-${size}`} className="text-sm">{size}</Label>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="font-headline text-lg mb-4">Material</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {allMaterials.map((material: string) => (
                    <div key={material} className="flex items-center gap-2">
                        <Checkbox 
                            id={`material-${material}`} 
                            checked={selectedMaterials.includes(material)} 
                            onCheckedChange={() => handleMaterialChange(material)} 
                        />
                        <Label htmlFor={`material-${material}`} className="text-sm capitalize">
                            {material}
                        </Label>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="font-headline text-lg mb-4">Price Range</h3>
            <Slider
                value={[priceRange]}
                max={15000}
                step={500}
                onValueChange={(value) => handlePriceChange(value[0])}
                className="mb-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹0</span>
                <span className="font-medium">₹{priceRange.toLocaleString('en-IN')}</span>
                <span>₹15,000</span>
            </div>
        </div>
    </div>
);

export function ShopClient({ products, allMaterials, allSizes }: ShopClientProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSale, setIsSale] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  useEffect(() => {
    const sizeParam = searchParams.get('size');
    const materialParam = searchParams.get('material');
    const searchParam = searchParams.get('search');
    const newArrivalParam = searchParams.get('isNewArrival');
    const saleParam = searchParams.get('isSale');

    if (sizeParam) setSelectedSizes([sizeParam]);
    if (materialParam) setSelectedMaterials([materialParam]);
    if (searchParam) setSearchQuery(searchParam);
    if (newArrivalParam === 'true') setIsNewArrival(true);
    if (saleParam === 'true') setIsSale(true);
  }, [searchParams]);

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };
  
  const handleMaterialChange = (material: string) => {
    setSelectedMaterials(prev => prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]);
  };

  const handlePriceChange = (value: number) => {
    setPriceRange(value);
  };
  
  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setPriceRange(15000);
    setSortOption('newest');
    setSearchQuery('');
    setIsNewArrival(false);
    setIsSale(false);
    router.push('/products');
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.material?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => selectedSizes.includes(product.size));
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(product => 
        selectedMaterials.some(material => 
          product.material?.toLowerCase().includes(material.toLowerCase())
        )
      );
    }

    // Price filter
    filtered = filtered.filter(product => product.price <= priceRange);

    // Flag filters
    if (isNewArrival) {
      filtered = filtered.filter(product => product.isNewArrival === true);
    }

    if (isSale) {
      filtered = filtered.filter(product => product.isSale === true);
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  }, [products, selectedSizes, selectedMaterials, priceRange, sortOption, searchQuery, isNewArrival, isSale]);

  const activeFilterCount = selectedSizes.length + selectedMaterials.length + 
    (priceRange < 15000 ? 1 : 0) + (isNewArrival ? 1 : 0) + (isSale ? 1 : 0) + 
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-4">
          <FilterSidebar
              allMaterials={allMaterials}
              allSizes={allSizes}
              selectedSizes={selectedSizes}
              handleSizeChange={handleSizeChange}
              selectedMaterials={selectedMaterials}
              handleMaterialChange={handleMaterialChange}
              priceRange={priceRange}
              handlePriceChange={handlePriceChange}
              isNewArrival={isNewArrival}
              setIsNewArrival={setIsNewArrival}
              isSale={isSale}
              setIsSale={setIsSale}
          />
        </div>
      </aside>
      
      <main className="lg:col-span-3">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products by name, description, or material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className='flex items-center gap-4'>
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" /> 
                                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                                <FilterSidebar
                                    allMaterials={allMaterials}
                                    allSizes={allSizes}
                                    selectedSizes={selectedSizes}
                                    handleSizeChange={handleSizeChange}
                                    selectedMaterials={selectedMaterials}
                                    handleMaterialChange={handleMaterialChange}
                                    priceRange={priceRange}
                                    handlePriceChange={handlePriceChange}
                                    isNewArrival={isNewArrival}
                                    setIsNewArrival={setIsNewArrival}
                                    isSale={isSale}
                                    setIsSale={setIsSale}
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
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </div>

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-headline mb-2">No Products Found</h2>
              <p className="text-muted-foreground mb-4">
                {searchQuery.trim() 
                  ? `No products match "${searchQuery}". Try different search terms or adjust your filters.`
                  : "Try adjusting your filters to find what you're looking for."
                }
              </p>
              <Button onClick={resetFilters}>Clear All Filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}