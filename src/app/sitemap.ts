import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';
import { catalogData } from '@/lib/catalog-seo';

// Retry on the next request after an outage; never freeze an empty catalog at build time.
export const dynamic = 'force-dynamic';

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '', priority: 1, changeFrequency: 'daily' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/reviews', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/shipping', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BRAND.domain}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  // One overall deadline also bounds pagination and response body consumption.
  const signal = AbortSignal.timeout(8000);
  const [products, categories] = await Promise.all([
    fetchProductEntries(signal), fetchCategoryEntries(signal),
  ]);
  return [...new Map([...staticEntries, ...categories, ...products].map(entry => [entry.url, entry])).values()];
}

function segment(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value === '.' || value === '..') return null;
  try { return encodeURIComponent(value); } catch { return null; }
}

async function fetchProductEntries(signal: AbortSignal): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  for (let page = 1; !signal.aborted; page++) {
    const data = await catalogData(`/products?limit=100&page=${page}&sort=_id`, signal);
    if (!Array.isArray(data?.products)) break;
    let added = 0;
    for (const product of data.products) {
      const id = segment(product?._id || product?.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      added++;
      const date = typeof product.updatedAt === 'string' ? new Date(product.updatedAt) : null;
      entries.push({
        url: `${BRAND.domain}/products/${id}`,
        ...(date && Number.isFinite(date.getTime()) ? { lastModified: date } : {}),
        changeFrequency: 'weekly', priority: 0.7,
      });
    }
    if (!added || data.pagination?.hasNext === false ||
      (typeof data.pagination?.totalPages === 'number' && page >= data.pagination.totalPages) ||
      (!data.pagination && data.products.length < 100)) break;
  }
  return entries;
}

async function fetchCategoryEntries(signal: AbortSignal): Promise<MetadataRoute.Sitemap> {
  const data = await catalogData('/products/categories', signal);
  if (!Array.isArray(data?.categories)) return [];
  return data.categories.flatMap((category: { slug?: unknown } | null) => {
    const slug = segment(category?.slug);
    return slug ? [{ url: `${BRAND.domain}/category/${slug}`, changeFrequency: 'weekly' as const, priority: 0.6 }] : [];
  });
}
