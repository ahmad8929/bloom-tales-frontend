import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { catalogData } from '@/lib/catalog-seo';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const data = await catalogData(`/products/${encodeURIComponent(productId)}`);
  const product = data?.product;
  return pageMetadata(`/products/${encodeURIComponent(productId)}`, typeof product?.name === 'string' ? product.name : 'Product', typeof product?.description === 'string' ? product.description : undefined, typeof product?.images?.[0]?.url === 'string' ? product.images[0].url : undefined);
}

export default function Page() { return <PageClient />; }
