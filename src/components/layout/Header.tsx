'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Settings, ShoppingCart, Loader2, Menu, X, Heart, Star, Crown } from 'lucide-react';
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

  const NavigationLink = ({ href, children, isActive = false, onClick, premium = false }: any) => (
    <Link href={href} onClick={onClick}>
      <Button 
        variant="ghost" 
        size="sm"
        className={`relative group transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg font-medium ${
          isActive 
            ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25' 
            : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/80 hover:to-pink-500/80'
        }
        `}
      >
        {/* {premium && <Crown className="w-3 h-3 mr-1 text-yellow-400" />} */}
        {children}
        {!isActive && (
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        )}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-60"></div>
        )}
      </Button>
    </Link>
  );

  return (
    <TooltipProvider>
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-2xl shadow-purple-500/10 border-b border-purple-100' 
          : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
      }`}>
        
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-20 w-2 h-2 bg-purple-200 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-4 right-32 w-1 h-1 bg-pink-200 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-3 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-100 opacity-30"></div>
          </div>

          {/* Enhanced Logo */}
          <div className="transform transition-all duration-300 hover:scale-110 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Logo className="flex-shrink-0 relative z-10" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200/50">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-gray-500 px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <>
                <NavigationLink href="/products" isActive={pathname === '/products'} premium>
                  All Products
                </NavigationLink>
                {categories.map((category, index) => (
                  <Tooltip key={category.slug}>
                    <TooltipTrigger asChild>
                      <NavigationLink 
                        href={`/category/${category.slug}`} 
                        isActive={isActiveCategory(category.slug)}
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                      </NavigationLink>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                      <p className="font-medium">
                        {category.count > 0 ? `${category.count} ${category.name} products` : `Explore ${category.name} collection`}
                      </p>
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
              className="relative bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-purple-600" /> : <Menu className="h-5 w-5 text-purple-600" />}
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Enhanced Cart Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative group bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-200/50"
                  >
                    <ShoppingBag className="h-5 w-5 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                    {itemCount > 0 && (
                      <>
                        <span className="absolute -top-2 -right-2 h-6 w-6 text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg z-10 animate-pulse">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                        <div className="absolute -top-2 -right-2 h-6 w-6 bg-pink-400/30 rounded-full animate-ping"></div>
                      </>
                    )}
                    {/* Floating hearts animation */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="w-2 h-2 text-pink-400 absolute top-1 right-1 animate-bounce delay-100" />
                    </div>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                <p className="font-medium">Shopping Cart {itemCount > 0 && `(${itemCount} items)`}</p>
              </TooltipContent>
            </Tooltip>

            {/* Enhanced User Account */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="group bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-200/50"
                      >
                        <Avatar className="transition-all duration-300 group-hover:scale-110">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                            {user.firstName?.[0] ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {user.role === 'admin' && (
                          <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                    <p className="font-medium">Welcome, {user.firstName}!</p>
                  </TooltipContent>
                </Tooltip>
                
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-lg border border-purple-100 shadow-2xl shadow-purple-500/20">
                  <DropdownMenuLabel className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold">
                          {user.firstName?.[0] ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-800">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                        {user.role === 'admin' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">Administrator</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                    <Link href="/orders" className="flex items-center gap-3 px-3 py-2">
                      <ShoppingCart className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-200">
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logoutUser} 
                    className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                  >
                    <User className="h-4 w-4 mr-3" />
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/login">
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 border-none font-medium px-6"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                  <p className="font-medium">Join Bloomtales Family</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-purple-100 bg-white/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-6 space-y-2">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <NavigationLink 
                  href="/products" 
                  isActive={pathname === '/products'}
                  onClick={() => setMobileMenuOpen(false)}
                  premium
                >
                  All Products
                </NavigationLink>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category, index) => (
                  <NavigationLink 
                    key={category.slug}
                    href={`/category/${category.slug}`} 
                    isActive={isActiveCategory(category.slug)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-sm">{category.name}</span>
                    {category.count > 0 && (
                      <span className="ml-1 text-xs text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">{category.count}</span>
                    )}
                  </NavigationLink>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Animated gradient border bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-2 left-4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-2 right-8 w-1 h-1 bg-pink-300 rounded-full animate-pulse opacity-50"></div>
      </header>
    </TooltipProvider>
  );
}