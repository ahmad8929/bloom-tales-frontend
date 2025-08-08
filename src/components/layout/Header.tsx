'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Settings, ShoppingCart, Loader2, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const itemCount = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await productApi.getCategories();
      
      if (response.data?.data?.categories) {
        const categoriesData = response.data.data.categories;
        setCategories(categoriesData.slice(0, 6));
      } else {
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

  const isActiveCategory = (slug: string) => {
    return pathname === `/category/${slug}`;
  };

  const NavigationLink = ({ href, children, isActive = false, onClick }: any) => (
    <Link href={href} onClick={onClick}>
      <Button 
        variant="ghost" 
        size="sm"
        className={`relative transition-all duration-200 hover:scale-105 hover:bg-primary/10 group px-3 ${
          isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        {children}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"></div>
        )}
      </Button>
    </Link>
  );

  return (
    <TooltipProvider>
      <header className={`border-b sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-lg' 
          : 'bg-background/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="transform transition-all duration-300 hover:scale-105">
            <Logo className="flex-shrink-0" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <NavigationLink href="/products" isActive={pathname === '/products'}>
                  All Products
                </NavigationLink>
                {categories.map((category) => (
                  <Tooltip key={category.slug}>
                    <TooltipTrigger asChild>
                      <NavigationLink 
                        href={`/category/${category.slug}`} 
                        isActive={isActiveCategory(category.slug)}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        {/* {category.count > 0 && (
                          <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {category.count}
                          </span>
                        )} */}
                      </NavigationLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.count > 0 ? `${category.count} ${category.name} products` : `${category.name} products`}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {itemCount > 0 && (
                      <>
                        <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium shadow-lg z-10">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary/30 rounded-full animate-ping"></div>
                      </>
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
                        className="transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                      >
                        <Avatar className="transition-all duration-200">
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
                
                <DropdownMenuContent align="end" className="w-56">
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
                      className="transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                    >
                      <User className="h-5 w-5" />
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

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <NavigationLink 
                href="/products" 
                isActive={pathname === '/products'}
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </NavigationLink>
              {categories.map((category) => (
                <NavigationLink 
                  key={category.slug}
                  href={`/category/${category.slug}`} 
                  isActive={isActiveCategory(category.slug)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{category.name}</span>
                  {category.count > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">{category.count}</span>
                  )}
                </NavigationLink>
              ))}
            </div>
          </div>
        )}

        {/* Animated border bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
      </header>
    </TooltipProvider>
  );
}