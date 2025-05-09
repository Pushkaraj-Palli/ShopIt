"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/app/lib/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface Product {
  id: string;
  _id?: string; // Optional MongoDB ID
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  // Handle both _id from MongoDB and id from props
  const productId = product.id || product._id;

  // Get a fallback image based on the product category
  const getFallbackImage = () => {
    const category = product.category.toLowerCase();
    if (category.includes('electronics')) return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop';
    if (category.includes('clothing')) return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop';
    if (category.includes('home') || category.includes('kitchen')) return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop';
    if (category.includes('books')) return 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop';
    if (category.includes('accessories')) return 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6e1?w=800&auto=format&fit=crop';
    // Default fallback
    return 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop';
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 3000,
    });
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your wishlist`,
      duration: 3000,
    });
  };

  // Determine which image to display
  const imageToShow = imageError ? getFallbackImage() : product.image;

  return (
    <Card
      className="overflow-hidden transition-all duration-300 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${productId}`}>
        <CardHeader className="p-0 relative">
          <div className="aspect-[4/5] overflow-hidden relative">
            <Image
              src={imageToShow}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              onError={() => setImageError(true)}
              unoptimized={imageToShow.startsWith('https://')}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-opacity duration-300 ${
                isHovered || isFavorite ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={toggleFavorite}
            >
              <Heart
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 bottom-0 bg-background/80 backdrop-blur-sm p-2"
              >
                <Button variant="secondary" size="sm" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </motion.div>
            )}
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center">
          <span className="text-xs text-muted-foreground">{product.category}</span>
          <div className="ml-auto flex items-center">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="ml-1 text-xs font-medium">{product.rating}</span>
          </div>
        </div>
        <Link href={`/product/${productId}`}>
          <h3 className="font-medium leading-tight line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="font-semibold">{formatPrice(product.price)}</div>
        <Link href={`/product/${productId}`} className="text-sm text-primary hover:underline">
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}