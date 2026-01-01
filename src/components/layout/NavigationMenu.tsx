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
      className={`transition-colors ${
        isMobile ? 'w-full justify-start px-4 py-2.5' : 'px-4 py-2'
      } rounded-md font-medium ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-foreground/70 hover:text-foreground hover:bg-accent'
      }`}
    >
      {premium && <Crown className="w-3 h-3 mr-1.5 text-yellow-400" />}
      {children}
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
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Navigation Section */}
      <div className="space-y-1 overflow-y-auto">
        <NavigationLink 
          href="/products" 
          isActive={pathname === '/products'}
          onClick={onItemClick}
          isMobile
        >
          All Products
        </NavigationLink>

        {loadingCategories ? (
          <div className="flex items-center gap-2 text-muted-foreground px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading categories...</span>
          </div>
        ) : Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category) => (
            <NavigationLink
              key={category.slug}
              href={`/category/${category.slug}`}
              isActive={pathname === `/category/${category.slug}`}
              onClick={onItemClick}
              isMobile
            >
              <div className="flex items-center justify-between w-full">
                <span>{category.name}</span>
                {category.count > 0 && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                )}
              </div>
            </NavigationLink>
          ))
        ) : (
          <div className="text-center text-muted-foreground px-4 py-3 text-sm">
            No categories available
          </div>
        )}
      </div>

      {/* User Section at Bottom */}
      <div className="border-t pt-4 space-y-1">
        {isAuthenticated && user ? (
          <>
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.firstName?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* User Actions */}
            <NavigationLink
              href="/orders"
              onClick={onItemClick}
              isMobile
            >
              <ShoppingCart className="h-4 w-4 mr-3" />
              My Orders
            </NavigationLink>

            <NavigationLink
              href="/profile"
              onClick={onItemClick}
              isMobile
            >
              <Settings className="h-4 w-4 mr-3" />
              Profile Settings
            </NavigationLink>

            {user.role === 'admin' && (
              <NavigationLink
                href="/admin"
                onClick={onItemClick}
                isMobile
              >
                <Crown className="h-4 w-4 mr-3 text-yellow-500" />
                Admin Panel
              </NavigationLink>
            )}

            <Button
              onClick={() => {
                logoutUser?.();
                onItemClick?.();
              }}
              variant="ghost"
              className="w-full justify-start px-4 py-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <User className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </>
        ) : (
          <NavigationLink
            href="/login"
            onClick={onItemClick}
            isMobile
          >
            <User className="h-4 w-4 mr-3" />
            Login / Sign Up
          </NavigationLink>
        )}
      </div>
    </div>
  );
}


  return (
    <nav className="hidden lg:flex items-center gap-1">
      {loadingCategories ? (
        <div className="flex items-center gap-2 text-muted-foreground px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <>
          <NavigationLink href="/products" isActive={pathname === '/products'}>
            All Products
          </NavigationLink>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <Tooltip key={category.slug}>
                <TooltipTrigger asChild>
                  <NavigationLink 
                    href={`/category/${category.slug}`} 
                    isActive={isActiveCategory(category.slug)}
                  >
                    {category.name}
                  </NavigationLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {category.count > 0 ? `${category.count} ${category.name} products` : `Explore ${category.name} collection`}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : null}
        </>
      )}
    </nav>
  );
}