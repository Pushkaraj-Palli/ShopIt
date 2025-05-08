import { Metadata } from 'next';
import ClientPage from './client-page';
import { categories } from '@/app/lib/data';

// This function is required for static site generation
export function generateStaticParams() {
  return categories.map(category => ({
    slug: category.slug,
  }));
}

// Generate metadata for each category
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const category = categories.find(cat => cat.slug === params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found - ShopIt E-commerce',
      description: 'The category you are looking for does not exist.'
    };
  }
  
  return {
    title: `${category.name} - ShopIt E-commerce`,
    description: category.description
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <ClientPage params={params} />;
} 