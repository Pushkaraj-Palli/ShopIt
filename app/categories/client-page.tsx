"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { categories } from '@/app/lib/data';

export default function ClientPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subCategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight lg:text-5xl/tight">
            Explore Categories
          </h1>
          <p className="mt-4 max-w-[700px] mx-auto text-muted-foreground md:text-lg">
            Discover our wide range of products across different categories to find exactly what you're looking for
          </p>
        </div>
        
        <div className="max-w-md mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Featured Categories */}
        <motion.div 
          className="pt-8 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredCategories
              .filter(category => category.featured)
              .map((category) => (
                <motion.div key={category.name} variants={item}>
                  <Link href={`/categories/${category.slug}`} className="group block h-full">
                    <div className="overflow-hidden rounded-lg h-full">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/60"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                          <h3 className="text-xl font-bold">{category.name}</h3>
                          <p className="mt-1 text-sm text-white/80">{category.description}</p>
                          <div className="mt-4 flex items-center text-sm font-medium">
                            <span>Explore</span>
                            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </motion.div>
        </motion.div>
        
        {/* All Categories */}
        <motion.div 
          className="pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">All Categories</h2>
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredCategories.map((category) => (
              <motion.div key={category.name} variants={item}>
                <div className="bg-card rounded-lg border p-6 h-full">
                  <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <div className="flex flex-col space-y-1 text-sm">
                    {category.subCategories.map((sub, index) => (
                      <Link 
                        key={index} 
                        href={`/categories/${category.slug}?sub=${sub.toLowerCase().replace(' ', '-')}`}
                        className="text-muted-foreground hover:text-primary hover:underline"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t">
                    <Button asChild variant="link" className="p-0 h-auto">
                      <Link href={`/categories/${category.slug}`} className="flex items-center">
                        <span>View all {category.name}</span>
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 