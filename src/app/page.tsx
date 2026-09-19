import { pageMetadata } from '@/lib/seo';
import PageClient from './PageClient';

export const metadata = pageMetadata('', "Bloomtales Boutique - Women's Fashion & Ethnic Wear");

export default function Page() { return <PageClient />; }
