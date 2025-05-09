"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product/product-card';

interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
}

interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  const router = useRouter();
  
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
  
  const handleProductClick = (product: Product) => {
    const productId = product.id || product._id;
    if (!productId) return;
    
    router.push(`/product/${productId}`);
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {products.map((product) => (
        <motion.div 
          key={product.id || product._id} 
          variants={item}
          onClick={() => handleProductClick(product)}
          className="cursor-pointer"
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}