import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { getSeoProduct, productDescription, productTitle, initialSize } from '@/lib/product-seo';
import { productData, breadcrumbData } from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';
import PageClient from './PageClient';

type Props = { params: Promise<{ productId: string }>; searchParams: Promise<{ size?: string | string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await getSeoProduct(productId);
  return pageMetadata(`/products/${encodeURIComponent(productId)}`, product ? productTitle(product) : `Product ${productId}`, product ? productDescription(product) : `Explore product ${productId} at Bloomtales Boutique.`, product?.images?.find(image => image.isPrimary)?.url || product?.images?.[0]?.url);
}
export default async function Page({ params, searchParams }: Props) {
  const { productId } = await params;
  const query = await searchParams;
  const product = await getSeoProduct(productId);
  const structured = product ? productData(product, productId) : null;
  const crumbs = product ? breadcrumbData([
    { name: 'Home', path: '/' }, { name: 'Products', path: '/products' },
    { name: product.name, path: `/products/${encodeURIComponent(productId)}` },
  ]) : null;
  return <>
    {structured && <JsonLd data={structured} />}
    {crumbs && <JsonLd data={crumbs} />}
    <PageClient key={`${productId}:${String(query.size)}`} initialProduct={product} initialSelectedSize={initialSize(product, typeof query.size === 'string' ? query.size : undefined)} />
  </>;
}
