"use client";

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ProductFilters() {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    brands: true,
    ratings: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
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
              <Checkbox id="cat-all" />
              <label htmlFor="cat-all" className="text-sm">All Categories</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-electronics" />
              <label htmlFor="cat-electronics" className="text-sm">Electronics</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-clothing" />
              <label htmlFor="cat-clothing" className="text-sm">Clothing</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-accessories" />
              <label htmlFor="cat-accessories" className="text-sm">Accessories</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-home" />
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
              defaultValue={[0, 500]}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={(value: number[]) => setPriceRange(value)}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm">${priceRange[0]}</span>
              <span className="text-sm">${priceRange[1]}+</span>
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
      
      <Button className="w-full">Apply Filters</Button>
      <Button variant="outline" className="w-full">Reset Filters</Button>
    </div>
  );
}