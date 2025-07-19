
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, User, Menu, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Logo } from '@/components/Logo';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useWishlist } from '@/hooks/useWishlist';

const navLinks = [
  { href: '/ai-stylist', label: 'AI Stylist' },
];

const megaMenu = {
  women: [
    { href: '/shop?category=western dress', label: 'Dresses' },
    { href: '/shop?category=top', label: 'Tops' },
    { href: '/shop?category=kurti', label: 'Kurti Sets' },
    { href: '/shop?category=saree', label: 'Sarees' },
    { href: '/shop?category=accessory', label: 'Accessories' },
  ],
  men: [
    { href: '/shop?category=men-topwear', label: 'Topwear' },
    { href: '/shop?category=men-bottomwear', label: 'Bottomwear' },
    { href: '/shop?category=men-ethnic', label: 'Ethnic' },
    { href: '/shop?category=men-accessories', label: 'Accessories' },
  ],
  kids: [
    { href: '/shop?category=boy-dress', label: 'Boys' },
    { href: '/shop?category=girl-dress', label: 'Girls' },
    { href: '/shop?category=baby-boy', label: 'Infant Boys' },
    { href: '/shop?category=baby-girl', label: 'Infant Girls' },
  ]
};

export function Header() {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistItemCount = wishlistItems.length;

  const MegaMenuLinks = ({ label, items }: { label: string, items: {href: string, label: string}[]}) => (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">{label}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            {items.map(item => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
  );

  const NavContent = () => (
    <>
      <MegaMenuLinks label="Women" items={megaMenu.women} />
      <MegaMenuLinks label="Men" items={megaMenu.men} />
      <MegaMenuLinks label="Kids" items={megaMenu.kids} />
      {navLinks.map((link) => (
        <Button key={link.href} variant="ghost" asChild>
          <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
            {link.label}
          </Link>
        </Button>
      ))}
       <Button variant="ghost" asChild>
        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
          Dashboard
        </Link>
      </Button>
    </>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-2">
          <NavContent />
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 border rounded-md px-2">
             <Search className="h-4 w-4 text-muted-foreground" />
             <Input type="search" placeholder="Search..." className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9" />
          </div>
          
           <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist" className="relative">
              <Heart />
              {wishlistItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {wishlistItemCount}
                </span>
              )}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingBag />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
            <Link href="/login">
              <User />
              <span className="sr-only">Login</span>
            </Link>
          </Button>

          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                 <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-8">
                  <NavContent />
                   <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-2" /> Login
                      </Link>
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
