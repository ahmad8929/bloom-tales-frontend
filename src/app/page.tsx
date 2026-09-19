import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { websiteData, organizationData } from '@/lib/structured-data';
import PageClient from './PageClient';

const title = "Bloomtales Boutique - Women's Fashion & Ethnic Wear";
export const metadata = {
  ...pageMetadata('', title, 'Shop Bloomtales for sarees, kurtis, ethnic wear and modern clothing. Explore our curated boutique collection with shipping across India.'),
  title: { absolute: title },
};
export default function Page() {
  return <><JsonLd data={[websiteData, organizationData]} /><PageClient /></>;
}
