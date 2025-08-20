import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2, Crown, ShoppingBag, Heart, User, Settings, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Category {
  name: string;
  count: number;
  slug: string;
}

interface NavigationMenuProps {
  categories: Category[];
  loadingCategories: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
  // Mobile sidebar props
  user?: any;
  isAuthenticated?: boolean;
  logoutUser?: () => void;
  itemCount?: number;
}

const NavigationLink = ({ 
  href, 
  children, 
  isActive = false, 
  onClick, 
  premium = false,
  isMobile = false 
}: {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  premium?: boolean;
  isMobile?: boolean;
}) => (
  <Link href={href} onClick={onClick}>
    <Button 
      variant="ghost" 
      size={isMobile ? "default" : "sm"}
      className={`relative group transition-all duration-300 hover:scale-105 ${
        isMobile ? 'w-full justify-start px-4 py-3' : 'px-3 lg:px-4 py-2'
      } rounded-lg font-medium ${
        isActive 
          ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25' 
          : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/80 hover:to-pink-500/80'
      }`}
    >
      {premium && <Crown className="w-3 h-3 mr-1 text-yellow-400" />}
      {children}
      {!isActive && (
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
      )}
      {isActive && !isMobile && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-60"></div>
      )}
    </Button>
  </Link>
);

export function NavigationMenu({ 
  categories, 
  loadingCategories, 
  isMobile = false, 
  onItemClick,
  // Mobile sidebar props
  user,
  isAuthenticated,
  logoutUser,
  itemCount = 0
}: NavigationMenuProps) {
  const pathname = usePathname();

  const isActiveCategory = (slug: string) => {
    return pathname === `/category/${slug}`;
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* User Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    {user.firstName?.[0] ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-800 truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-600 truncate">{user.email}</div>
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">Administrator</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Actions */}
              <div className="space-y-1">
                <NavigationLink 
                  href="/orders" 
                  onClick={onItemClick}
                  isMobile
                >
                  <ShoppingCart className="h-4 w-4 mr-3 text-purple-600" />
                  My Orders
                </NavigationLink>
                
                <NavigationLink 
                  href="/profile" 
                  onClick={onItemClick}
                  isMobile
                >
                  <Settings className="h-4 w-4 mr-3 text-purple-600" />
                  Profile Settings
                </NavigationLink>
                
                {user.role === 'admin' && (
                  <NavigationLink 
                    href="/admin" 
                    onClick={onItemClick}
                    isMobile
                  >
                    <Crown className="h-4 w-4 mr-3 text-yellow-600" />
                    <span className="text-yellow-800">Admin Panel</span>
                  </NavigationLink>
                )}
                
                <Button 
                  onClick={() => {
                    logoutUser?.();
                    onItemClick?.();
                  }}
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                >
                  <User className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <NavigationLink 
              href="/login" 
              onClick={onItemClick}
              isMobile
            >
              <User className="h-4 w-4 mr-3 text-purple-600" />
              Login / Sign Up
            </NavigationLink>
          )}
        </div>

        {/* Cart Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <NavigationLink 
            href="/cart" 
            onClick={onItemClick}
            isMobile
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  {itemCount > 0 && (
                    <>
                      <span className="absolute -top-2 -right-2 h-4 w-4 text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                      <Heart className="absolute -top-1 -right-1 w-2 h-2 text-pink-400 animate-pulse" />
                    </>
                  )}
                </div>
                <span className="font-medium">Shopping Cart</span>
              </div>
              {itemCount > 0 && (
                <span className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded-full font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </NavigationLink>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <NavigationLink 
              href="/products" 
              isActive={pathname === '/products'}
              onClick={onItemClick}
              premium
              isMobile
            >
              All Products
            </NavigationLink>
          </div>
          
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-gray-500 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              <span className="text-sm">Loading categories...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category.slug} className="bg-gray-50/80 rounded-lg">
                  <NavigationLink 
                    href={`/category/${category.slug}`} 
                    isActive={isActiveCategory(category.slug)}
                    onClick={onItemClick}
                    isMobile
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium">{category.name}</span>
                      {category.count > 0 && (
                        <span className="ml-2 text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      )}
                    </div>
                  </NavigationLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200/50">
      {loadingCategories ? (
        <div className="flex items-center gap-2 text-gray-500 px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <>
          <NavigationLink href="/products" isActive={pathname === '/products'} premium>
            <span className="hidden xl:inline">All Products</span>
            <span className="xl:hidden">Products</span>
          </NavigationLink>
          {categories.map((category) => (
            <Tooltip key={category.slug}>
              <TooltipTrigger asChild>
                <NavigationLink 
                  href={`/category/${category.slug}`} 
                  isActive={isActiveCategory(category.slug)}
                >
                  <span className="text-xs xl:text-sm font-medium">{category.name}</span>
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
  );
}