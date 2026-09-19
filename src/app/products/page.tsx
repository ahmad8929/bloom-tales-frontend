import { pageMetadata } from '@/lib/seo';
import PageClient from './PageClient';

export const metadata = pageMetadata('/products', 'Shop All Products');

export default function Page() { return <PageClient />; }
