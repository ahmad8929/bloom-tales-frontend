'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { productApi } from "@/lib/api";
import { TooltipProvider } from '@/components/ui/tooltip';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// Import components
import { Logo } from '@/components/Logo';
import { NavigationMenu } from '@/components/layout/NavigationMenu';
import { CartButton } from '@/components/layout/CartButton';
import { UserMenu } from '@/components/layout/UserMenu';
import { headerIconButton } from '@/lib/ui';

interface Category {
  name: string;
  count: number;
  slug: string;
}

export function Header() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logoutUser } = useAuth();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      <header className={`sticky top-0 z-50 transition-all duration-300 relative ${
        scrolled 
          ? 'bg-card/98 backdrop-blur-md shadow-md border-b border-border' 
          : 'bg-card/98 backdrop-blur-sm border-b border-border/50'
      }`}>
        {/* Dark overlay for darker background */}
        <div className="absolute inset-0 bg-text-normal/10 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4 relative z-10">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo className="transition-transform duration-300 hover:scale-105" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* <Button
              asChild
              variant="outline"
              size="icon"
              className="
                bg-card border-border
                hover:bg-secondary-hover
                hover:border-primary/30
                shadow-sm hover:shadow-md
                transition-all duration-300
                h-10 w-10
                rounded-md
              "
            >
              <Link href="/products" className="flex items-center justify-center w-full h-full">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-text-normal" />
              </Link>
            </Button> */}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon" className={headerIconButton}>
                  <Link href="/products" className="flex items-center justify-center w-full h-full">
                    <Package className="h-5 w-5 text-text-normal" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground border-none">
                <p className="font-medium">Products</p>
              </TooltipContent>
            </Tooltip>


            <CartButton itemCount={itemCount} />

            <UserMenu 
              user={user}
              isAuthenticated={isAuthenticated}
              logoutUser={logoutUser}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card/98 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[80vh] overflow-y-auto">
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
        )}
      </header>
    </TooltipProvider>
  );
}