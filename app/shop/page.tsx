import { ProductFilters } from '@/components/product/product-filters';
import ClientPage from './client-page';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

export const metadata = {
  title: 'Shop - ShopIt E-commerce',
  description: 'Browse our collection of premium products',
};

// This makes this a Server Component
export default async function ShopPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  const searchTerm = searchParams?.search || '';
  
  // Connect to MongoDB
  await connectToDatabase();
  
  // Fetch products from MongoDB
  const dbProducts = await Product.find({}).limit(50);
  
  // Transform MongoDB documents to the format expected by our components
  const products = dbProducts.map(product => {
    const productObj = product.toObject();
    return {
      id: productObj._id.toString(),
      name: productObj.name,
      price: productObj.price,
      category: productObj.category,
      categorySlug: productObj.categorySlug,
      subCategory: productObj.subCategory,
      rating: productObj.rating,
      image: productObj.image,
      description: productObj.description,
    };
  });
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {searchTerm ? `Search Results: "${searchTerm}"` : 'Shop All Products'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {searchTerm 
              ? `Showing results for "${searchTerm}"`
              : 'Browse our complete collection of premium products'}
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden md:block">
            <ProductFilters />
          </aside>
          
          <ClientPage products={products} />
        </div>
      </div>
    </div>
  );
}