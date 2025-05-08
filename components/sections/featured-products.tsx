"use client";

import { useState } from 'react';
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
  }
];

export function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home'];
  
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
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {filteredProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex">
            <CarouselPrevious className="absolute -left-12 top-1/2" />
            <CarouselNext className="absolute -right-12 top-1/2" />
          </div>
        </Carousel>
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