"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from '@/components/product/product-card';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
}

export function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home & Kitchen', 'Books'];
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=6');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        } else {
          console.error('Failed to fetch products:', data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <section className="container px-4 md:px-6 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Featured Products</h2>
        <p className="max-w-[700px] text-center text-muted-foreground md:text-lg">
          Explore our collection of premium products curated for your lifestyle
        </p>
      </motion.div>
      
      <div className="mt-8 flex items-center justify-center space-x-2 overflow-x-auto pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          filteredProducts.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredProducts.map((product) => (
                  <CarouselItem key={product._id || product.id} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <ProductCard product={{
                        id: product._id?.toString() || product.id || '',
                        name: product.name,
                        price: product.price,
                        category: product.category,
                        rating: product.rating,
                        image: product.image,
                        description: product.description
                      }} />
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex">
                <CarouselPrevious className="absolute -left-12 top-1/2" />
                <CarouselNext className="absolute -right-12 top-1/2" />
              </div>
            </Carousel>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No products found in this category
            </div>
          )
        )}
      </div>
      
      <div className="mt-10 flex justify-center">
        <Link 
          href="/shop"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}