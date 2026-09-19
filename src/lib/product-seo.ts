import { cache } from 'react';
import { catalogData } from '@/lib/catalog-seo';
import type { Product } from '@/types/product';

export const getSeoProduct = cache(async (id: string): Promise<Product | null> => {
  const data = await catalogData(`/products/${encodeURIComponent(id)}`);
  const product = data?.product;
  return product && typeof product.name === 'string' && Array.isArray(product.images) ? product : null;
});

export function initialSize(product: Product | null, requested?: string): string {
  const variants = product?.variants?.filter(variant => variant && typeof variant.size === 'string') ?? [];
  return variants.find(variant => variant.size === requested)?.size
    ?? variants.find(variant => variant.stock > 0)?.size
    ?? variants[0]?.size ?? product?.size ?? '';
}

export function productTitle(product: Product): string {
  const colors = product.colors?.map(color => color?.name).filter(Boolean).join(' / ') || product.color?.name;
  return colors ? `${product.name} - ${colors}` : product.name;
}

export function productDescription(product: Product): string {
  const summary = typeof product.description === 'string' ? product.description.replace(/\s+/g, ' ').trim() : '';
  return `${productTitle(product)}: ${summary || 'Shop this style at Bloomtales Boutique.'}`.slice(0, 170);
}
