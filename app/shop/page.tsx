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
  searchParams?: { 
    search?: string; 
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const searchTerm = searchParams?.search || '';
  const categoryFilter = searchParams?.category || '';
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : undefined;
  
  // Connect to MongoDB
  await connectToDatabase();
  
  // Build the query
  const query: any = {};
  
  // Add category filter if present
  if (categoryFilter) {
    // Match category slug to one of our defined categories
    // This uses case-insensitive matching for flexibility
    query.categorySlug = new RegExp(`^${categoryFilter}$`, 'i');
  }
  
  // Add price range filters if present
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    
    if (minPrice !== undefined) {
      query.price.$gte = minPrice;
    }
    
    if (maxPrice !== undefined) {
      query.price.$lte = maxPrice;
    }
  }
  
  // Fetch products from MongoDB with the filter
  const dbProducts = await Product.find(query).limit(50);
  
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
  
  // Get the category name for display purposes
  let categoryName = '';
  if (categoryFilter) {
    switch (categoryFilter) {
      case 'electronics':
        categoryName = 'Electronics';
        break;
      case 'clothing':
        categoryName = 'Clothing';
        break;
      case 'accessories':
        categoryName = 'Accessories';
        break;
      case 'home':
        categoryName = 'Home & Living';
        break;
      default:
        categoryName = '';
    }
  }
  
  // Price range description for display
  let priceRangeText = '';
  if (minPrice !== undefined && maxPrice !== undefined) {
    priceRangeText = ` priced between $${minPrice.toLocaleString()} and $${maxPrice.toLocaleString()}`;
  } else if (minPrice !== undefined) {
    priceRangeText = ` priced above $${minPrice.toLocaleString()}`;
  } else if (maxPrice !== undefined) {
    priceRangeText = ` priced up to $${maxPrice.toLocaleString()}`;
  }
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {searchTerm 
              ? `Search Results: "${searchTerm}"` 
              : categoryName 
                ? `Shop ${categoryName}` 
                : 'Shop All Products'
            }
          </h1>
          <p className="mt-2 text-muted-foreground">
            {searchTerm 
              ? `Showing results for "${searchTerm}"${categoryName ? ` in ${categoryName}` : ''}${priceRangeText}`
              : categoryName
                ? `Browse our collection of ${categoryName} products${priceRangeText}`
                : `Browse our complete collection of premium products${priceRangeText}`
            }
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