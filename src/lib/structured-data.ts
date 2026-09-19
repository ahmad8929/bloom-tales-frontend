import { BRAND } from '@/lib/constants/brand';
import type { Product } from '@/types/product';

const root = `${BRAND.domain}/`;
export const websiteData = {
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${root}#website`,
  name: 'Bloomtales', alternateName: 'Bloomtales Boutique', url: root,
  publisher: { '@id': `${root}#organization` },
};
export const organizationData = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': `${root}#organization`,
  name: BRAND.name, legalName: BRAND.legalName, url: root,
  logo: { '@type': 'ImageObject', url: `${BRAND.domain}/icon`, width: 512, height: 512 },
  email: BRAND.email, telephone: BRAND.phone, sameAs: [BRAND.instagram],
};
export function breadcrumbData(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${BRAND.domain}${item.path}`,
    })),
  };
}

export function productData(product: Product, id: string) {
  const url = `${BRAND.domain}/products/${encodeURIComponent(id)}`;
  const images = product.images?.map(image => image?.url).filter(url => typeof url === 'string' && /^https?:\/\//.test(url)) ?? [];
  if (!product.name || !images.length || typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0) return null;
  const common = {
    name: product.name, description: product.description || undefined, image: images,
    // Color/material labels describe the product; they are not inventory variants.
    color: product.colors?.map(color => color?.name).filter(Boolean).join(' / ') || product.color?.name || undefined,
    material: product.material || undefined,
  };
  const offer = (offerUrl: string, stock?: number) => ({
    '@type': 'Offer', url: offerUrl, price: product.price, priceCurrency: 'INR',
    ...(typeof stock === 'number' && Number.isFinite(stock) ? { availability: `https://schema.org/${stock > 0 ? 'InStock' : 'OutOfStock'}` } : {}),
    seller: { '@type': 'Organization', '@id': `${root}#organization`, name: BRAND.name, url: root },
  });
  const variants = [...new Map((product.variants ?? []).filter(v => v && typeof v.size === 'string' && v.size).map(v => [v.size, v])).values()];
  if (variants.length) {
    return {
      '@context': 'https://schema.org', '@type': 'ProductGroup', '@id': `${url}#product-group`,
      ...common, url, productGroupID: id, variesBy: ['https://schema.org/size'],
      hasVariant: variants.map(variant => {
        const variantUrl = `${url}?size=${encodeURIComponent(variant.size)}`;
        return {
          '@type': 'Product', '@id': `${url}#size-${encodeURIComponent(variant.size)}`,
          ...common, name: `${product.name} - ${variant.size}`, size: variant.size,
          productID: `${id}-${variant.size}`, ...(variant.sku ? { sku: variant.sku } : {}),
          url: variantUrl, offers: offer(variantUrl, variant.stock),
        };
      }),
    };
  }
  // Legacy products have no authoritative stock quantity; do not invent availability.
  return { '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, ...common, url, productID: id, size: product.size, offers: offer(url) };
}
