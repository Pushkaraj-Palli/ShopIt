import { Metadata } from 'next';
import ClientPage from './client-page';

// Export metadata for the page
export const metadata: Metadata = {
  title: 'Shop by Categories - ShopIt E-commerce',
  description: 'Browse our wide range of product categories to find exactly what you need',
};

export default function CategoriesPage() {
  return <ClientPage />;
} 