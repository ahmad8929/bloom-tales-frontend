'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Package, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Logo } from '@/components/Logo';
import { CartItem } from '@/types/cart';
import { useAuth } from '@/hooks/useAuth';
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

export function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const { user, isAuthenticated, logoutUser } = useAuth();

  const itemCount = cartItems.reduce((total: number, item: CartItem) => total + item.quantity, 0);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Products', icon: Package },
  ];

  return (
    <TooltipProvider>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo with animation */}
          <div className="transform transition-all duration-300 hover:scale-105">
            <Logo className="flex-shrink-0" />
          </div>

          {/* Navigation with icons */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link href={href}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`relative transition-all duration-300 hover:scale-110 hover:bg-primary/10 group
                        ${pathname === href 
                          ? 'text-primary bg-primary/10 shadow-lg' 
                          : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 group-hover:scale-110
                        ${pathname === href ? 'animate-pulse' : ''}`} />
                      
                      {/* Active indicator */}
                      {pathname === href && (
                        <div className="absolute inset-0 rounded-md bg-primary/20 animate-pulse"></div>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>

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
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
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

        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-background/95">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex items-center justify-center gap-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`flex items-center gap-2 transition-all duration-300 hover:scale-105
                      ${pathname === href 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-primary'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{label}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Animated border bottom */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
      </header>
    </TooltipProvider>
  );
}