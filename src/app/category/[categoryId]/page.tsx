import { JsonLd } from '@/components/JsonLd';
import { breadcrumbData } from '@/lib/structured-data';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PageClient from './PageClient';

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }): Promise<Metadata> {
  const { categoryId } = await params;
  const title = categoryId.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  return pageMetadata(`/category/${encodeURIComponent(categoryId)}`, `${title} Collection`, `Shop the ${title} collection at Bloomtales Boutique.`);
}

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const title = categoryId.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  return <><JsonLd data={breadcrumbData([
    { name: 'Home', path: '/' }, { name: 'Products', path: '/products' },
    { name: `${title} Collection`, path: `/category/${encodeURIComponent(categoryId)}` },
  ])} /><PageClient /></>;
}
