'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { productApi } from "@/lib/api";
import { TooltipProvider } from '@/components/ui/tooltip';

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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b' 
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo className="transition-transform duration-300 hover:scale-105" />
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-1 justify-center">
              <NavigationMenu 
                categories={categories}
                loadingCategories={loadingCategories}
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CartButton itemCount={itemCount} />

              <UserMenu 
                user={user}
                isAuthenticated={isAuthenticated}
                logoutUser={logoutUser}
              />

              {/* Mobile Menu Button */}
              <MobileMenuButton 
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 py-4 max-h-[80vh] overflow-y-auto">
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