'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { productApi } from "@/lib/api";
import { CartItem } from '@/types/cart';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Import components
import { Logo } from '@/components/Logo';
import { NavigationMenu } from '@/components/layout/NavigationMenu';
import { CartButton } from '@/components/layout/CartButton';
import { UserMenu } from '@/components/layout/UserMenu';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';

interface Category {
  name: string;
  count: number;
  slug: string;
}

export function Header() {
  const { cartItems } = useCart();
  const { user, isAuthenticated, logoutUser } = useAuth();
  
  // State management
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await productApi.getCategories();
      
      if (response.data?.data?.categories && Array.isArray(response.data.data.categories)) {
        const categoriesData = response.data.data.categories;
        // If categories array is empty, show "No data available" message
        if (categoriesData.length === 0) {
          setCategories([]);
        } else {
          setCategories(categoriesData.slice(0, 6));
        }
      } else {
        // No categories available
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // On error, set empty array instead of default categories
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <TooltipProvider>
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-[#5A3E2B]/95 backdrop-blur-lg shadow-2xl shadow-primary/10 border-b border-primary/20' 
          : 'bg-[#5A3E2B]/95 backdrop-blur-md border-b border-primary/20'
      }`}>
        
        <div className="container mx-auto px-2 sm:px-3 lg:px-6 h-14 sm:h-16 flex items-center justify-between relative gap-2">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-16 sm:left-20 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary/30 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-3 sm:top-4 right-24 sm:right-32 w-1 h-1 bg-hover/40 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute bottom-2 sm:bottom-3 left-1/4 sm:left-1/3 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-primary/40 rounded-full animate-pulse delay-100 opacity-30"></div>
          </div>

          {/* Enhanced Logo */}
          <div className="transform transition-all duration-300 hover:scale-110 group relative z-10 flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Logo className="relative z-10" />
          </div>

          {/* Desktop Navigation */}
          {/* <div className="flex-1 flex justify-center mx-2 sm:mx-4 lg:mx-8">
            <NavigationMenu 
              categories={categories}
              loadingCategories={loadingCategories}
            />
          </div> */}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
  
            {/* Products Button - Desktop Only */}
            <div className="hidden lg:block">
              <Button
                asChild
                className="
                  bg-primary/90 text-primary-foreground
                  hover:bg-hover
                  hover:shadow-xl hover:shadow-primary/30
                  hover:-translate-y-0.5
                  transition-all duration-300
                  px-5 py-2 rounded-full
                  text-sm font-semibold
                "
              >
                <Link href="/products">
                  Our Products
                </Link>
              </Button>
            </div>

            {/* Products Button - Mobile Only */}
            <div className="lg:hidden">
              <Button
                asChild
                className="
                  bg-primary/90 text-primary-foreground
                  hover:bg-hover
                  hover:shadow-xl hover:shadow-primary/30
                  hover:-translate-y-0.5
                  transition-all duration-300
                  px-4 py-2 rounded-full
                  text-xs sm:text-sm font-semibold
                "
              >
                <Link href="/products">
                  Products
                </Link>
              </Button>
            </div>

            {/* Cart Button - Desktop Only */}
            <div className="hidden lg:block">
              <CartButton itemCount={itemCount} />
            </div>

            {/* User Menu - Desktop Only */}
            <div className="hidden lg:block">
              <UserMenu 
                user={user}
                isAuthenticated={isAuthenticated}
                logoutUser={logoutUser}
              />
            </div>

            {/* Mobile Menu Button */}
            <MobileMenuButton 
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>


        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {/* Commented out navigation in mobile screen */}
        {/* {mobileMenuOpen && (
          <div className="lg:hidden border-t border-primary/20 bg-[#5A3E2B]/95 backdrop-blur-lg">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-h-[80vh] overflow-y-auto">
              <NavigationMenu 
                categories={categories}
                loadingCategories={loadingCategories}
                isMobile
                onItemClick={closeMobileMenu}
                user={user}
                isAuthenticated={isAuthenticated}
                logoutUser={logoutUser}
                itemCount={itemCount}
              />
            </div>
          </div>
        )} */}

        {/* Animated gradient border bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-1 sm:top-2 left-2 sm:left-4 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-primary/50 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-1 sm:bottom-2 right-6 sm:right-8 w-0.5 sm:w-1 h-0.5 sm:h-1 bg-hover/50 rounded-full animate-pulse opacity-50"></div>
      </header>
    </TooltipProvider>
  );
}