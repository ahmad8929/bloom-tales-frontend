'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, ArrowRight, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { UserMenu } from '@/components/layout/UserMenu';
import { Logo } from '@/components/Logo';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SEARCH_SUGGESTIONS, EASE_LUXE } from '@/lib/constants';

export function Header() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logoutUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const { categories, loading: loadingCategories } = useCategories(8);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close overlays on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, [pathname]);

  // Lock body scroll while an overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOpen]);

  // Focus search input when the overlay opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery('');
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  return (
    <TooltipProvider>
      <header
        className={cn(
          'glass sticky top-0 z-50 border-b border-border text-heading transition-shadow duration-500',
          scrolled && 'shadow-sm shadow-heading/5'
        )}
        onMouseLeave={() => setShopOpen(false)}
      >
        <div className="container flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex flex-1 items-center gap-6">
            <button
              className="lg:hidden -ml-1 p-1.5"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) =>
                link.label === 'Shop' ? (
                  <div key={link.label} className="relative" onMouseEnter={() => setShopOpen(true)}>
                    <Link
                      href={link.href}
                      data-active={pathname === '/products'}
                      className="link-underline font-sans text-[12px] font-semibold uppercase tracking-luxe transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onMouseEnter={() => setShopOpen(false)}
                    className={cn(
                      'link-underline font-sans text-[12px] font-semibold uppercase tracking-luxe transition-colors hover:text-gold',
                      link.label === 'Sale' && 'text-gold'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Center: official Bloom Tales logo */}
          <Logo />

          {/* Right: actions */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <button
              className="p-2 transition-colors hover:text-gold"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="hidden sm:block">
              {isAuthenticated && user ? (
                <UserMenu user={user} isAuthenticated={isAuthenticated} logoutUser={logoutUser} />
              ) : (
                <Link
                  href="/login"
                  className="block p-2 transition-colors hover:text-gold"
                  aria-label="Login"
                >
                  <User className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              )}
            </div>

            <Link
              href="/cart"
              className="relative p-2 transition-colors hover:text-gold"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[9px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Shop mega-panel (desktop) */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE_LUXE }}
              className="glass absolute inset-x-0 top-full hidden border-b border-border text-heading lg:block"
            >
              <div className="container grid grid-cols-4 gap-10 py-10">
                <div className="col-span-1 border-r border-border pr-10">
                  <p className="eyebrow mb-4">Collections</p>
                  <p className="font-display text-2xl leading-snug">
                    Curated pieces for every story you wear.
                  </p>
                  <Link
                    href="/products"
                    className="mt-6 inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-luxe text-gold hover:gap-3 transition-all"
                  >
                    View everything <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-x-10 gap-y-4">
                  {loadingCategories ? (
                    <p className="text-sm text-text-muted">Loading collections…</p>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="group flex items-baseline justify-between border-b border-border/60 pb-3 transition-colors hover:border-gold"
                      >
                        <span className="font-display text-lg transition-colors group-hover:text-gold">
                          {category.name}
                        </span>
                        <span className="font-sans text-[10px] uppercase tracking-luxe text-text-muted">
                          {category.count}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link href="/products?isNewArrival=true" className="group flex items-baseline justify-between border-b border-border/60 pb-3 transition-colors hover:border-gold">
                        <span className="font-display text-lg transition-colors group-hover:text-gold">New Arrivals</span>
                      </Link>
                      <Link href="/products?isSale=true" className="group flex items-baseline justify-between border-b border-border/60 pb-3 transition-colors hover:border-gold">
                        <span className="font-display text-lg transition-colors group-hover:text-gold">On Sale</span>
                      </Link>
                      <Link href="/products" className="group flex items-baseline justify-between border-b border-border/60 pb-3 transition-colors hover:border-gold">
                        <span className="font-display text-lg transition-colors group-hover:text-gold">All Products</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass fixed inset-0 z-[60] flex flex-col"
          >
            <div className="container flex h-16 items-center justify-end lg:h-20">
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="p-2 text-heading transition-colors hover:text-gold"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.5, ease: EASE_LUXE, delay: 0.08 }}
              className="container mt-[14vh]"
            >
              <p className="eyebrow mb-6 text-center">Search the maison</p>
              <form onSubmit={submitSearch} className="mx-auto flex max-w-2xl items-center gap-4 border-b-2 border-heading pb-4">
                <Search className="h-6 w-6 shrink-0 text-text-muted" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sarees, kurtis, lehengas…"
                  className="w-full bg-transparent font-display text-2xl text-heading placeholder:text-text-muted/50 focus:outline-none md:text-4xl"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="p-2 text-heading transition-colors hover:text-gold"
                >
                  <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
                </button>
              </form>
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3">
                {SEARCH_SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(`/products?search=${encodeURIComponent(term)}`);
                    }}
                    className="border border-border bg-card px-4 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-luxe text-text-normal transition-all hover:border-gold hover:text-gold"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
              className="fixed inset-y-0 left-0 z-[61] flex w-[85vw] max-w-sm flex-col bg-background lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <Logo />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-8">
                <nav className="space-y-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: EASE_LUXE }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center justify-between border-b border-border/60 py-4 font-display text-2xl text-heading"
                      >
                        {link.label}
                        <ArrowRight className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {categories.length > 0 && (
                  <div className="mt-10">
                    <p className="eyebrow mb-4">Collections</p>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/category/${category.slug}`}
                          className="block font-sans text-sm text-text-normal transition-colors hover:text-gold"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-5 py-5">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <p className="font-sans text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm text-text-muted">
                      <Link href="/orders" className="hover:text-gold">My Orders</Link>
                      <Link href="/profile" className="hover:text-gold">Profile</Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="hover:text-gold">Admin</Link>
                      )}
                      <button onClick={logoutUser} className="text-destructive">
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-luxe"
                  >
                    <User className="h-4 w-4" strokeWidth={1.5} />
                    Sign in / Create account
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
