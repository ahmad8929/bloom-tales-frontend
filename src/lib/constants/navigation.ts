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

export const FOOTER_HELP_LINKS = [
  { name: 'FAQs', href: '/faq' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Customer Reviews', href: '/reviews' },
] as const;

export const FOOTER_POLICY_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms Of Services', href: '/terms' },
] as const;

export const SEARCH_SUGGESTIONS = ['Saree', 'Kurti', 'Lehenga', 'Anarkali', 'Western'] as const;
