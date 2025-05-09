import { Suspense } from 'react';
import { Metadata } from 'next';
import connectToDatabase from '@/app/lib/mongodb';
import Product from '@/app/models/Product';
import ClientPage from './client-page';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Product Details - ShopIt',
  description: 'View detailed information about this product',
};

// Required for static export with dynamic routes
export async function generateStaticParams() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get all product IDs to pre-render
    const products = await Product.find({}, '_id').limit(50);
    
    // Return an array of objects with id parameter
    return products.map((product) => ({
      id: product._id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array as fallback
    return [];
  }
}

// Server component that fetches the product data
export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let product = null;
  let errorMessage = null;
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Find the product by ID
    const foundProduct = await Product.findById(id);
    
    if (foundProduct) {
      // Transform MongoDB document to the expected format
      const productObj = foundProduct.toObject();
      product = {
        id: productObj._id.toString(),
        _id: productObj._id.toString(),
        name: productObj.name,
        price: productObj.price,
        category: productObj.category,
        categorySlug: productObj.categorySlug,
        subCategory: productObj.subCategory,
        rating: productObj.rating,
        image: productObj.image,
        description: productObj.description,
        // These fields are hardcoded for now
        numReviews: 12,
        countInStock: 10,
        features: [
          'Premium quality material',
          'Durable and long-lasting',
          'Comfortable design',
          'Easy to maintain',
          'Stylish appearance'
        ],
        specifications: {
          'Material': 'Premium quality',
          'Weight': 'Lightweight',
          'Dimensions': 'Standard size',
          'Warranty': '1 year',
          'Color': 'As shown'
        }
      };
    } else {
      errorMessage = 'Product not found';
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    errorMessage = 'Failed to load product';
  }

  return (
    <Suspense fallback={<ProductLoadingSkeleton />}>
      <ClientPage initialProduct={product} initialError={errorMessage} />
    </Suspense>
  );
}

// Loading skeleton for Suspense fallback
function ProductLoadingSkeleton() {
  return (
    <div className="container px-4 md:px-6 py-6 md:py-12">
      <div className="mb-4">
        <div className="inline-flex items-center text-sm font-medium text-muted-foreground rounded-md h-8 w-24 bg-muted animate-pulse"></div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-muted animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md"></div>
          <div className="h-4 w-1/4 bg-muted animate-pulse rounded-md"></div>
          <div className="h-6 w-1/4 bg-muted animate-pulse rounded-md"></div>
          <div className="h-24 w-full bg-muted animate-pulse rounded-md"></div>
          <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}