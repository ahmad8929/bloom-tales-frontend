// Official Bloom Tales brand palette & identity.
// These hex values are the single source of truth; the CSS variables in
// globals.css are the HSL equivalents used by Tailwind tokens.

export const BRAND_COLORS = {
  champagneWhite: '#FDFBF9', // header, navbar, footer backgrounds
  warmGoldenBeige: '#B89B84', // logo, nav text, headings, product titles
  dustyRose: '#D8A7A1', // hover/active links, primary buttons, prices, icons
  softBlushPink: '#F3E0DC', // hero background
  nudeLinen: '#EAD9CF', // alternating sections, hero subheading
  warmCream: '#FAF4F0', // alternating sections, product cards, borders
  sageGreen: '#A6B7A3', // secondary buttons
} as const;

export const BRAND = {
  name: 'Bloomtales',
  tagline: 'Boutique',
  email: 'bloomtalesclothing@gmail.com',
  phone: '+91 8076465961',
  location: 'Bareilly, Uttar Pradesh, India',
  hours: 'Mon–Sat · 9AM–8PM',
  instagram: 'https://www.instagram.com/bloomtales_clothing/',
} as const;
