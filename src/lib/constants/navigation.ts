// Central navigation data — shared by Header, Footer and mobile navigation.

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'New In', href: '/products?isNewArrival=true' },
  { label: 'Shop', href: '/products' },
  { label: 'Sale', href: '/products?isSale=true' },
  { label: 'Our Story', href: '/about' },
];

export const FOOTER_SHOP_LINKS = [
  { name: 'New Arrivals', href: '/products?isNewArrival=true' },
  { name: 'All Products', href: '/products' },
  { name: 'On Sale', href: '/products?isSale=true' },
  { name: 'Your Cart', href: '/cart' },
] as const;

export const FOOTER_CARE_LINKS = [
  { name: 'FAQ', href: '/faq' },
  { name: 'Shipping & Returns', href: '/shipping' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { name: 'Our Story', href: '/about' },
  { name: 'Contact', href: '/contact' },
] as const;

export const SEARCH_SUGGESTIONS = ['Saree', 'Kurti', 'Lehenga', 'Anarkali', 'Western'] as const;
