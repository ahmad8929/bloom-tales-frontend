'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, SlidersHorizontal, Search, Check } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { PRODUCT_COLORS, PRODUCT_SIZES } from '@/lib/constants';
import { Stagger, StaggerItem } from '@/components/motion/primitives';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ShopClientProps {
  products: any[];
  allSizes: string[];
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

const FilterSidebar = ({
    allSizes,
    selectedSizes,
    handleSizeChange,
    selectedColors,
    handleColorChange,
    priceRange,
    handlePriceChange,
    isNewArrival,
    setIsNewArrival,
    isSale,
    setIsSale,
    isStretched,
    setIsStretched
}: any) => (
    <div className="space-y-10">
        <div>
            <p className="eyebrow mb-5">Refine</p>
            <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                        id="new-arrival"
                        checked={isNewArrival}
                        onCheckedChange={setIsNewArrival}
                    />
                    <span className="font-sans text-sm text-text-normal">New Arrivals</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                        id="on-sale"
                        checked={isSale}
                        onCheckedChange={setIsSale}
                    />
                    <span className="font-sans text-sm text-text-normal">On Sale</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                        id="is-stretched"
                        checked={isStretched}
                        onCheckedChange={setIsStretched}
                    />
                    <span className="font-sans text-sm text-text-normal">Already Stretched</span>
                </label>
            </div>
        </div>

        <div className="hairline" />

        <div>
            <p className="eyebrow mb-5">Size</p>
            <div className="flex flex-wrap gap-2">
                {PRODUCT_SIZES.map((size) => {
                    const isAvailable = allSizes.includes(size);
                    const isSelected = selectedSizes.includes(size);
                    return (
                        <button
                            key={size}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleSizeChange(size)}
                            className={`flex h-10 min-w-[2.75rem] items-center justify-center border px-3 font-sans text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${
                                isSelected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-transparent text-text-normal hover:border-primary'
                            } ${!isAvailable ? 'cursor-not-allowed opacity-30' : ''}`}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="hairline" />

        <div>
            <p className="eyebrow mb-5">Colour</p>
            <div className="grid grid-cols-6 gap-2.5">
                {PRODUCT_COLORS.map((color) => {
                    const isSelected = selectedColors?.includes(color.name) ?? false;
                    return (
                        <button
                            key={color.name}
                            type="button"
                            title={color.name}
                            aria-label={color.name}
                            aria-pressed={isSelected}
                            onClick={() => handleColorChange(color.name)}
                            className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                                isSelected
                                    ? 'border-gold ring-1 ring-gold ring-offset-2 ring-offset-background'
                                    : 'border-border hover:border-gold'
                            }`}
                            style={{ backgroundColor: color.hexCode }}
                        >
                            {isSelected && (
                                <Check
                                    className="h-3.5 w-3.5 drop-shadow"
                                    style={{
                                        color:
                                            ['#000000', '#000080', '#800000', '#722F37', '#800020', '#36454F', '#3D5B3D', '#006A4E', '#6F4E37', '#7B3F00'].includes(color.hexCode)
                                                ? '#fff'
                                                : '#221B16',
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {selectedColors.length > 0 && (
                <p className="mt-3 font-sans text-xs text-text-muted">
                    {selectedColors.length} colour{selectedColors.length > 1 ? 's' : ''} selected
                </p>
            )}
        </div>

        <div className="hairline" />

        <div>
            <p className="eyebrow mb-5">Price</p>
            <Slider
                value={[priceRange]}
                max={15000}
                step={500}
                onValueChange={(value) => handlePriceChange(value[0])}
                className="mb-4"
            />
            <div className="flex justify-between font-sans text-xs text-text-muted">
                <span>₹0</span>
                <span className="font-semibold text-heading">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
                <span>₹15,000</span>
            </div>
        </div>
    </div>
);

export function ShopClient({ products, allSizes }: ShopClientProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [isStretched, setIsStretched] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSyncingFromUrl = useRef(false);

  // Fetch cart once for all products
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await cartApi.getCart();
        if (response.data?.data?.cart?.items) {
          setCartItems(response.data.data.cart.items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.log('Cart fetch failed:', error);
        setCartItems([]);
      }
    };

    fetchCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      if (isAuthenticated) {
        fetchCart();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isAuthenticated]);

  // Initialize filters from URL params
  useEffect(() => {
    isSyncingFromUrl.current = true;

    const sizeParams = searchParams.getAll('size');
    const colorParams = searchParams.getAll('color');
    const searchParam = searchParams.get('search');
    const priceParam = searchParams.get('maxPrice');
    const newArrivalParam = searchParams.get('isNewArrival');
    const saleParam = searchParams.get('isSale');
    const stretchedParam = searchParams.get('isStretched');
    const sortParam = searchParams.get('sort') as SortOption | null;

    // Update sizes - reset if empty
    setSelectedSizes(sizeParams.length > 0 ? sizeParams : []);
    // Update colors - reset if empty
    setSelectedColors(colorParams.length > 0 ? colorParams : []);
    // Update search - reset if empty
    setSearchQuery(searchParam || '');
    // Update price range
    if (priceParam) {
      const price = parseInt(priceParam);
      if (!isNaN(price)) setPriceRange(price);
    } else {
      setPriceRange(15000);
    }
    // Update boolean flags - reset if not present
    setIsNewArrival(newArrivalParam === 'true');
    setIsSale(saleParam === 'true');
    setIsStretched(stretchedParam === 'true');
    // Update sort
    if (sortParam && ['newest', 'price-asc', 'price-desc', 'name-asc'].includes(sortParam)) {
      setSortOption(sortParam);
    } else {
      setSortOption('newest');
    }

    // Reset flag after a short delay to allow state updates to complete
    setTimeout(() => {
      isSyncingFromUrl.current = false;
    }, 0);
  }, [searchParams]);

  // Update URL params when filters change (but skip initial mount to avoid conflicts)
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    // Skip URL update on initial mount (let URL params initialize state first)
    if (isInitialMount) return;

    // Skip if we're currently syncing from URL params to avoid infinite loop
    if (isSyncingFromUrl.current) return;

    const params = new URLSearchParams();

    selectedSizes.forEach(size => params.append('size', size));
    selectedColors.forEach(color => params.append('color', color));

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }

    if (priceRange < 15000) {
      params.set('maxPrice', priceRange.toString());
    }

    if (isNewArrival) {
      params.set('isNewArrival', 'true');
    }

    if (isSale) {
      params.set('isSale', 'true');
    }

    if (isStretched) {
      params.set('isStretched', 'true');
    }

    if (sortOption !== 'newest') {
      params.set('sort', sortOption);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    const currentQueryString = window.location.search;
    const newQueryString = queryString ? `?${queryString}` : '';

    // Only update URL if the query string is different to avoid infinite loops
    if (currentQueryString !== newQueryString) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedSizes, selectedColors, searchQuery, priceRange, isNewArrival, isSale, isStretched, sortOption, router, isInitialMount]);

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
    setPriceRange(15000);
    setSortOption('newest');
    setSearchQuery('');
    setIsNewArrival(false);
    setIsSale(false);
    setIsStretched(false);
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

    // Color filter - check if any of the product's colors match selected colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        // Check if product has colors array
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          return product.colors.some((color: any) =>
            selectedColors.includes(color.name)
          );
        }
        // Fallback to single color field
        return product.color && selectedColors.includes(product.color.name);
      });
    }

    // Size filter - check variants if they exist, otherwise check legacy size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => {
        // Check if product has variants with the selected size and stock > 0
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          return product.variants.some((v: any) =>
            selectedSizes.includes(v.size) && v.stock > 0
          );
        }
        // Fallback to legacy size field
        return product.size && selectedSizes.includes(product.size);
      });
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

    if (isStretched) {
      filtered = filtered.filter(product => product.isStretched === true);
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
  }, [products, selectedSizes, selectedColors, priceRange, sortOption, searchQuery, isNewArrival, isSale, isStretched]);

  const activeFilterCount = selectedSizes.length + selectedColors.length +
    (priceRange < 15000 ? 1 : 0) + (isNewArrival ? 1 : 0) + (isSale ? 1 : 0) +
    (isStretched ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  return (
    <div className="grid gap-12 lg:grid-cols-4">
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-8 pr-4">
          <FilterSidebar
              allSizes={allSizes}
              selectedSizes={selectedSizes}
              handleSizeChange={handleSizeChange}
              selectedColors={selectedColors}
              handleColorChange={handleColorChange}
              priceRange={priceRange}
              handlePriceChange={handlePriceChange}
              isNewArrival={isNewArrival}
              setIsNewArrival={setIsNewArrival}
              isSale={isSale}
              setIsSale={setIsSale}
              isStretched={isStretched}
              setIsStretched={setIsStretched}
          />
        </div>
      </aside>

      <main className="lg:col-span-3">
        {/* Search */}
        <div className="mb-8 flex items-center gap-3 border-b border-border pb-3 transition-colors focus-within:border-gold">
          <Search className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} />
          <input
            placeholder="Search by name, fabric or feeling…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent font-sans text-sm text-heading placeholder:text-text-muted/60 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X className="h-4 w-4 text-text-muted transition-colors hover:text-heading" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="secondary" size="sm">
                                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] overflow-y-auto bg-background sm:w-[380px]">
                            <div className="p-6">
                                <h2 className="mb-8 font-display text-2xl">Filters</h2>
                                <FilterSidebar
                                    allSizes={allSizes}
                                    selectedSizes={selectedSizes}
                                    handleSizeChange={handleSizeChange}
                                    selectedColors={selectedColors}
                                    handleColorChange={handleColorChange}
                                    priceRange={priceRange}
                                    handlePriceChange={handlePriceChange}
                                    isNewArrival={isNewArrival}
                                    setIsNewArrival={setIsNewArrival}
                                    isSale={isSale}
                                    setIsSale={setIsSale}
                                    isStretched={isStretched}
                                    setIsStretched={setIsStretched}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <p className="font-sans text-xs uppercase tracking-luxe text-text-muted">
                  {filteredAndSortedProducts.length} of {products.length} pieces
                </p>

                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-luxe text-gold transition-colors hover:text-heading"
                  >
                    <X className="h-3.5 w-3.5" /> Clear ({activeFilterCount})
                  </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Label htmlFor="sort" className="whitespace-nowrap font-sans text-xs uppercase tracking-luxe text-text-muted">
                  Sort
                </Label>
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="w-[180px] border-0 border-b border-border bg-transparent px-0 font-sans text-sm focus:ring-0" id="sort">
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

        {/* Products Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <Stagger gap={0.05} className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 lg:grid-cols-3">
            {filteredAndSortedProducts.map(product => (
              <StaggerItem key={product._id || product.id}>
                <ProductCard
                  product={product}
                  cartItems={cartItems}
                />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="border border-dashed border-border py-24 text-center">
            <div className="mx-auto max-w-md px-6">
              <h2 className="mb-3 font-display text-3xl">Nothing quite matches</h2>
              <p className="mb-8 text-sm leading-relaxed text-text-muted">
                {searchQuery.trim()
                  ? `We couldn't find anything for "${searchQuery}". Try different words or loosen a filter.`
                  : "Try adjusting your filters to find what you're looking for."
                }
              </p>
              <Button onClick={resetFilters} variant="outline">Clear All Filters</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
