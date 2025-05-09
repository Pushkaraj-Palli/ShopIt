"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/app/lib/utils';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialCategory = searchParams.get('category') || '';
  const initialMinPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
  const initialMaxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 50000;
  
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    brands: true,
    ratings: true,
  });
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Update when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    
    // Update price range from URL params
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 50000;
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL with selected category
    const params = new URLSearchParams(searchParams.toString());
    
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // Keep existing search term if any
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    // Keep price range filters
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    }
    if (priceRange[1] < 50000) {
      params.set('maxPrice', priceRange[1].toString());
    }
    
    // Navigate with the updated params
    router.push(`/shop?${params.toString()}`);
  };
  
  // Debounced price range handler
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };
  
  // Apply price filter when slider interaction ends
  const handlePriceRangeCommit = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // For price range, we always want to show products from 0 to maxPrice
    // when only the upper handle is adjusted
    
    // Only add minPrice if it's not the default (0)
    if (priceRange[0] > 0) {
      params.set('minPrice', priceRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    // Only add maxPrice if it's not the default (50000)
    if (priceRange[1] < 50000) {
      params.set('maxPrice', priceRange[1].toString());
      
      // If only maxPrice is set, we want to show products from 0 to maxPrice
      if (priceRange[0] === 0) {
        params.delete('minPrice');
      }
    } else {
      params.delete('maxPrice');
    }
    
    // Keep category if any
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    // Keep search term if any
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    // Navigate with the updated params
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex w-full items-center justify-between font-medium"
        >
          Categories
          {expandedSections.categories ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {expandedSections.categories && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat-all" 
                checked={selectedCategory === '' || selectedCategory === 'all'}
                onCheckedChange={() => handleCategoryChange('all')}
              />
              <label htmlFor="cat-all" className="text-sm">All Categories</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat-electronics" 
                checked={selectedCategory === 'electronics'}
                onCheckedChange={() => handleCategoryChange('electronics')}
              />
              <label htmlFor="cat-electronics" className="text-sm">Electronics</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat-clothing" 
                checked={selectedCategory === 'clothing'}
                onCheckedChange={() => handleCategoryChange('clothing')}
              />
              <label htmlFor="cat-clothing" className="text-sm">Clothing</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat-accessories" 
                checked={selectedCategory === 'accessories'}
                onCheckedChange={() => handleCategoryChange('accessories')}
              />
              <label htmlFor="cat-accessories" className="text-sm">Accessories</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cat-home" 
                checked={selectedCategory === 'home'}
                onCheckedChange={() => handleCategoryChange('home')}
              />
              <label htmlFor="cat-home" className="text-sm">Home & Living</label>
            </div>
          </div>
        )}
      </div>
      
      {/* Price Range Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection('priceRange')}
          className="flex w-full items-center justify-between font-medium"
        >
          Price Range
          {expandedSections.priceRange ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {expandedSections.priceRange && (
          <div className="mt-4 px-1">
            <Slider
              defaultValue={[0, 50000]}
              max={50000}
              step={1000}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              onValueCommit={handlePriceRangeCommit}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">{formatPrice(priceRange[0])}</span>
              <span className="text-sm">{priceRange[1] === 50000 ? `${formatPrice(priceRange[1])}+` : formatPrice(priceRange[1])}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Brands Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection('brands')}
          className="flex w-full items-center justify-between font-medium"
        >
          Brands
          {expandedSections.brands ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {expandedSections.brands && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="brand-all" />
              <label htmlFor="brand-all" className="text-sm">All Brands</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="brand-apple" />
              <label htmlFor="brand-apple" className="text-sm">Apple</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="brand-samsung" />
              <label htmlFor="brand-samsung" className="text-sm">Samsung</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="brand-nike" />
              <label htmlFor="brand-nike" className="text-sm">Nike</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="brand-adidas" />
              <label htmlFor="brand-adidas" className="text-sm">Adidas</label>
            </div>
          </div>
        )}
      </div>
      
      {/* Ratings Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection('ratings')}
          className="flex w-full items-center justify-between font-medium"
        >
          Ratings
          {expandedSections.ratings ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        
        {expandedSections.ratings && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="rating-4plus" />
              <label htmlFor="rating-4plus" className="text-sm">4 Stars & Above</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="rating-3plus" />
              <label htmlFor="rating-3plus" className="text-sm">3 Stars & Above</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="rating-2plus" />
              <label htmlFor="rating-2plus" className="text-sm">2 Stars & Above</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="rating-1plus" />
              <label htmlFor="rating-1plus" className="text-sm">1 Star & Above</label>
            </div>
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          // Reset all filters
          const search = searchParams.get('search');
          if (search) {
            router.push(`/shop?search=${search}`);
          } else {
            router.push('/shop');
          }
          setSelectedCategory('');
          setPriceRange([0, 50000]);
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
}