import { ProductsGrid } from '@/components/product/products-grid';
import { ProductFilters } from '@/components/product/product-filters';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';

export const metadata = {
  title: 'Shop - ShopIt E-commerce',
  description: 'Browse our collection of premium products',
};

// This makes this a Server Component
export default async function ShopPage() {
  // Connect to MongoDB
  await connectToDatabase();
  
  // Fetch products from the database
  const dbProducts = await Product.find({}).limit(28);
  
  // Transform MongoDB documents to the expected format for our components
  // MongoDB uses _id, but our components expect id
  const products = dbProducts.map(product => {
    const productObj = product.toObject();
    return {
      id: productObj._id.toString(),
      name: productObj.name,
      price: productObj.price,
      category: productObj.category,
      rating: productObj.rating,
      image: productObj.image,
      description: productObj.description,
      // Include any other fields needed
      categorySlug: productObj.categorySlug,
      subCategory: productObj.subCategory,
    };
  });
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop All Products</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our complete collection of premium products
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden md:block">
            <ProductFilters />
          </aside>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <strong>{products.length}</strong> products
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select className="h-8 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm">
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="best-rated">Best Rated</option>
                </select>
              </div>
            </div>
            
            <ProductsGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}