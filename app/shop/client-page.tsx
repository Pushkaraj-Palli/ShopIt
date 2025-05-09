"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductsGrid } from '@/components/product/products-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { formatPrice } from '@/app/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categorySlug: string;
  subCategory: string;
  rating: number;
  image: string;
  description: string;
}

export default function ClientPage({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortOption, setSortOption] = useState('newest');
  
  // Filter and sort products when searchTerm or sortOption changes
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'best-rated':
          return b.rating - a.rating;
        default: // newest
          return 0; // Keep original order for now
      }
    });
    
    setFilteredProducts(result);
  }, [products, searchTerm, sortOption]);
  
  // Update search input when URL search param changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);
  
  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build the URL with all current parameters
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    if (categoryFilter) {
      params.set('category', categoryFilter);
    }
    
    // Keep price range parameters
    if (minPrice) {
      params.set('minPrice', minPrice);
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    
    // Remove only the search parameter, keep other filters
    const params = new URLSearchParams();
    
    if (categoryFilter) {
      params.set('category', categoryFilter);
    }
    
    // Keep price range parameters
    if (minPrice) {
      params.set('minPrice', minPrice);
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <select 
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="best-rated">Best Rated</option>
          </select>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing <strong>{filteredProducts.length}</strong> products
        {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
        {categoryFilter && (
          <span> in <strong>
            {categoryFilter === 'electronics' && 'Electronics'}
            {categoryFilter === 'clothing' && 'Clothing'}
            {categoryFilter === 'accessories' && 'Accessories'}
            {categoryFilter === 'home' && 'Home & Living'}
          </strong></span>
        )}
        {(minPrice || maxPrice) && (
          <span> with price range <strong>
            {minPrice && maxPrice 
              ? `${formatPrice(parseInt(minPrice))} - ${formatPrice(parseInt(maxPrice))}`
              : minPrice 
                ? `from ${formatPrice(parseInt(minPrice))}`
                : `up to ${formatPrice(parseInt(maxPrice))}`
            }
          </strong></span>
        )}
      </div>
      
      {filteredProducts.length > 0 ? (
        <ProductsGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
} 