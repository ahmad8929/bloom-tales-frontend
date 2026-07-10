// Shared formatting helpers — use these instead of re-implementing
// price/date/image logic inside components.

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Format a number as Indian Rupees, e.g. 12345 → "₹12,345". */
export function formatPrice(price: number | string): string {
  const value = Number(price);
  if (!Number.isFinite(value)) return '₹0';
  return INR_FORMATTER.format(value);
}

/** Format an ISO date string for display, e.g. "12 Jan 2026". */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Format an ISO date string with time, e.g. "12 Jan 2026, 4:30 pm". */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const PLACEHOLDER_PRODUCT_IMAGE = '/placeholder-product.jpg';

/** Resolve a product image entry (string or { url }) to a usable src. */
export function getImageUrl(imageData: unknown): string {
  if (typeof imageData === 'string' && imageData) return imageData;
  if (imageData && typeof imageData === 'object' && 'url' in imageData) {
    const url = (imageData as { url?: string }).url;
    if (url) return url;
  }
  return PLACEHOLDER_PRODUCT_IMAGE;
}

/** First (primary) image of a product, with placeholder fallback. */
export function getPrimaryImage(product: { images?: unknown[] }): string {
  const images = product.images ?? [];
  return images.length > 0 ? getImageUrl(images[0]) : PLACEHOLDER_PRODUCT_IMAGE;
}

/** Discount percentage between compare price and price, 0 when not discounted. */
export function getDiscountPercentage(price: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
