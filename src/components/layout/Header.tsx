'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Settings, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Logo } from '@/components/Logo';
import { CartItem } from '@/types/cart';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { productApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Category {
  name: string;
  count: number;
  slug: string;
}

export function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { user, isAuthenticated, logoutUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const itemCount = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('=== FETCHING CATEGORIES FOR NAVBAR ===');
      
      const response = await productApi.getCategories();
      console.log('Categories API response:', response);
      
      if (response.data?.data?.categories) {
        const categoriesData = response.data.data.categories;
        console.log('Categories data:', categoriesData);
        setCategories(categoriesData.slice(0, 6)); // Limit to 6 categories
      } else if (response.error) {
        console.error('Error in categories API response:', response.error);
        // Show default categories
        setCategories([
          { name: 'Saree', count: 0, slug: 'saree' },
          { name: 'Kurti', count: 0, slug: 'kurti' },
          { name: 'Suite', count: 0, slug: 'suite' },
          { name: 'Night Dress', count: 0, slug: 'night-dress' },
          { name: 'Skirt', count: 0, slug: 'skirt' },
          { name: 'Top', count: 0, slug: 'top' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        { name: 'Saree', count: 0, slug: 'saree' },
        { name: 'Kurti', count: 0, slug: 'kurti' },
        { name: 'Suite', count: 0, slug: 'suite' },
        { name: 'Night Dress', count: 0, slug: 'night-dress' },
        { name: 'Skirt', count: 0, slug: 'skirt' },
        { name: 'Top', count: 0, slug: 'top' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Check if current path matches a category route
  const isActiveCategory = (slug: string) => {
    return pathname === `/category/${slug}`;
  };

  return (
    <TooltipProvider>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo with animation */}
          <div className="transform transition-all duration-300 hover:scale-105">
            <Logo className="flex-shrink-0" />
          </div>

          {/* Category Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                {/* All Products Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/products">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`transition-all duration-300 hover:scale-105 hover:bg-primary/10 group px-3
                          ${pathname === '/products' 
                            ? 'text-primary bg-primary/10 shadow-lg' 
                            : 'text-muted-foreground hover:text-primary'
                          }`}
                      >
                        <span className={`transition-all duration-300 group-hover:scale-110 text-sm font-medium
                          ${pathname === '/products' ? 'animate-pulse' : ''}`}>
                          All Products
                        </span>
                        
                        {/* Active indicator */}
                        {pathname === '/products' && (
                          <div className="absolute inset-0 rounded-md bg-primary/20 animate-pulse"></div>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View All Products</p>
                  </TooltipContent>
                </Tooltip>

                {/* Category Links */}
                {categories.map((category) => (
                  <Tooltip key={category.slug}>
                    <TooltipTrigger asChild>
                      <Link href={`/category/${category.slug}`}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`transition-all duration-300 hover:scale-105 hover:bg-primary/10 group px-3 relative
                            ${isActiveCategory(category.slug)
                              ? 'text-primary bg-primary/10 shadow-lg' 
                              : 'text-muted-foreground hover:text-primary'
                            }`}
                        >
                          <span className={`transition-all duration-300 group-hover:scale-110 text-sm font-medium
                            ${isActiveCategory(category.slug) ? 'animate-pulse' : ''}`}>
                            {category.name}
                          </span>
                          
                          {/* Product count badge */}
                          {category.count > 0 && (
                            <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full group-hover:bg-primary/20 transition-colors">
                              {category.count}
                            </span>
                          )}
                          
                          {/* Active indicator */}
                          {isActiveCategory(category.slug) && (
                            <div className="absolute inset-0 rounded-md bg-primary/20 animate-pulse"></div>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.count > 0 ? `${category.count} ${category.name} products` : `${category.name} products`}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </>
            )}
          </nav>

          {/* Mobile Navigation Dropdown */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/products" className="w-full cursor-pointer">
                    All Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link href={`/category/${category.slug}`} className="w-full cursor-pointer flex justify-between">
                      <span>{category.name}</span>
                      {category.count > 0 && (
                        <span className="text-xs text-muted-foreground">{category.count}</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon with Animation */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative transition-all duration-300 hover:scale-110 hover:bg-primary/10 group"
                  >
                    <ShoppingBag className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center animate-bounce font-medium shadow-lg">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                    
                    {/* Ripple effect for cart updates */}
                    {itemCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary/30 rounded-full animate-ping"></div>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shopping Cart {itemCount > 0 && `(${itemCount} items)`}</p>
              </TooltipContent>
            </Tooltip>

            {/* User Account */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="transition-all duration-300 hover:scale-110 hover:bg-primary/10 group"
                      >
                        <Avatar className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user.firstName?.[0] ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Account Menu</p>
                  </TooltipContent>
                </Tooltip>
                
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 animate-in slide-in-from-top-2 duration-200"
                >
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/orders" className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logoutUser} 
                    className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="transition-all duration-300 hover:scale-110 hover:bg-primary/10 group"
                    >
                      <User className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Login / Register</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Animated border bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
      </header>
    </TooltipProvider>
  );
}