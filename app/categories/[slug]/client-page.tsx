"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Filter, Search, SlidersHorizontal, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/product/product-card';
import { ProductFilters } from '@/components/product/product-filters';
import { categories, products as allProducts } from '@/app/lib/data';

export default function ClientPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const subCategoryParam = searchParams.get('sub');
  
  const [searchTerm, setSearchTerm] = useState('');
  const category = categories.find(cat => cat.slug === slug);
  
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    subCategoryParam || null
  );
  
  // Get all products for this category (regardless of subcategory)
  const allCategoryProducts = allProducts.filter(product => 
    product.categorySlug === slug
  );
  
  // Get filtered products based on subcategory and search
  const products = allProducts.filter(product => {
    const matchesCategory = product.categorySlug === slug;
    const matchesSubCategory = activeSubCategory 
      ? product.subCategory.toLowerCase() === activeSubCategory.replace('-', ' ').toLowerCase() 
      : true;
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCategory && matchesSubCategory && matchesSearch;
  });
  
  // Check if we're using a filter that might be causing no results
  const isFiltered = activeSubCategory !== null || searchTerm !== '';
  
  const handleClearFilters = () => {
    setActiveSubCategory(null);
    setSearchTerm('');
  };
  
  useEffect(() => {
    if (subCategoryParam) {
      setActiveSubCategory(subCategoryParam);
    }
  }, [subCategoryParam]);
  
  if (!category) {
    return (
      <div className="container px-4 md:px-6 py-10 text-center">
        <h1 className="text-3xl font-bold">Category Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          The category you're looking for doesn't exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/categories">View All Categories</Link>
        </Button>
      </div>
    );
  }
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  
  return (
    <div className="container px-4 md:px-6 py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/categories" className="hover:text-primary">Categories</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">{category.name}</span>
          </div>
          
          <div className="relative aspect-[5/2] w-full overflow-hidden rounded-xl">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
              <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
              <p className="mt-2 max-w-lg text-white/80">{category.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search in ${category.name}...`}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <ProductFilters />
              </SheetContent>
            </Sheet>
            
            <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm w-full md:w-[180px]">
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-rated">Best Rated</option>
            </select>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-20">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Subcategories</h3>
                  <ul className="space-y-1">
                    <li>
                      <Button
                        variant={activeSubCategory === null ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => setActiveSubCategory(null)}
                      >
                        All {category.name}
                      </Button>
                    </li>
                    {category.subCategories.map((sub) => (
                      <li key={sub}>
                        <Button
                          variant={activeSubCategory === sub.toLowerCase().replace(' ', '-') ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => setActiveSubCategory(sub.toLowerCase().replace(' ', '-'))}
                        >
                          {sub}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <ProductFilters />
              </div>
            </div>
          </aside>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <strong>{products.length}</strong> products in{" "}
                <strong>
                  {activeSubCategory 
                    ? category.subCategories.find(sub => 
                        sub.toLowerCase().replace(' ', '-') === activeSubCategory)
                    : category.name}
                </strong>
              </p>
            </div>
            
            {products.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {products.map((product) => (
                  <motion.div key={product.id} variants={item}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                
                {isFiltered && allCategoryProducts.length > 0 ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2">No Products Found With Current Filters</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      We couldn't find any products matching your current selection. Try adjusting your filters or search terms.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <Button onClick={handleClearFilters}>
                        Clear All Filters
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/categories">
                          Browse Other Categories
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2">No Products Found in This Category</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      We're currently working on adding products to this category. Check back soon or explore our other categories.
                    </p>
                    <Button asChild>
                      <Link href="/categories">
                        Browse Other Categories
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 