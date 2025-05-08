"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Electronics',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Top-tier gadgets and tech',
    slug: 'electronics'
  },
  {
    name: 'Clothing',
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stylish apparel for all',
    slug: 'clothing'
  },
  {
    name: 'Accessories',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Complete your look',
    slug: 'accessories'
  },
  {
    name: 'Home & Living',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elevate your space',
    slug: 'home'
  }
];

export function Categories() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="container px-4 md:px-6 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Shop by Category</h2>
        <p className="max-w-[700px] text-muted-foreground md:text-lg">
          Browse our carefully curated categories to find exactly what you need
        </p>
      </motion.div>
      
      <motion.div 
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {categories.map((category) => (
          <motion.div key={category.name} variants={item}>
            <Link href={`/categories/${category.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg">
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
                      <span>Shop Now</span>
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}