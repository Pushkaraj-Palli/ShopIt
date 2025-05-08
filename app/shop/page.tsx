import { ProductsGrid } from '@/components/product/products-grid';
import { ProductFilters } from '@/components/product/product-filters';

// Mock data - would be fetched from API in a real scenario
const products = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 249.99,
    category: 'Electronics',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience unparalleled sound quality with our premium wireless headphones.'
  },
  {
    id: '2',
    name: 'Designer Leather Jacket',
    price: 349.99,
    category: 'Clothing',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elevate your style with this luxurious leather jacket, perfect for any occasion.'
  },
  {
    id: '3',
    name: 'Smart Watch Series X',
    price: 299.99,
    category: 'Electronics',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Track your fitness and stay connected with our latest smart watch.'
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    price: 89.99,
    category: 'Home',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Add a touch of elegance to your workspace with our minimalist desk lamp.'
  },
  {
    id: '5',
    name: 'Premium Sunglasses',
    price: 179.99,
    category: 'Accessories',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Protect your eyes in style with our premium UV-protected sunglasses.'
  },
  {
    id: '6',
    name: 'Organic Cotton T-Shirt',
    price: 39.99,
    category: 'Clothing',
    rating: 4.5,
    image: 'https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stay comfortable and eco-friendly with our organic cotton t-shirt.'
  },
  {
    id: '7',
    name: 'Wireless Earbuds',
    price: 129.99,
    category: 'Electronics',
    rating: 4.4,
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience freedom with our lightweight wireless earbuds.'
  },
  {
    id: '8',
    name: 'Modern Coffee Table',
    price: 249.99,
    category: 'Home',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Upgrade your living space with this sleek, modern coffee table.'
  }
];

export const metadata = {
  title: 'Shop - ShopIt E-commerce',
  description: 'Browse our collection of premium products',
};

export default function ShopPage() {
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