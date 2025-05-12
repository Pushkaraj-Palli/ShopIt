import { Metadata } from 'next';
import ClientPage from './client-page';
import { categories } from '@/app/lib/data';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const category = categories.find(cat => cat.slug === slug);
  
  return {
    title: category ? `${category.name} - Shop by Category` : 'Category - ShopIt',
    description: category?.description || 'Explore our product categories',
  }
}

// Generate static params for all known categories
export function generateStaticParams() {
  return categories.map(category => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: Props) {
  return <ClientPage params={params} />;
} 