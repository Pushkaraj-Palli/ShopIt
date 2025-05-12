"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/cart-context';
import { WishlistButton } from '@/components/product/wishlist-button';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/app/lib/utils';

// Define product interface
interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
  categorySlug?: string;
  subCategory?: string;
  numReviews?: number;
  countInStock?: number;
  features?: string[];
  specifications?: Record<string, string>;
}

interface ProductClientProps {
  initialProduct: Product | null;
  initialError: string | null;
}

export default function ClientPage({ initialProduct, initialError }: ProductClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (initialProduct && initialProduct.countInStock && quantity < initialProduct.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!initialProduct) return;
    
    // Create a product object with the selected quantity
    const productToAdd = {
      id: initialProduct._id || initialProduct.id as string,
      name: initialProduct.name,
      price: initialProduct.price,
      image: initialProduct.image,
      quantity: quantity // Pass the selected quantity
    };
    
    // Add the product to cart
    addToCart(productToAdd);
    
    toast({
      title: "Added to cart",
      description: `${initialProduct.name} (${quantity}) has been added to your cart`,
      duration: 3000,
    });
    
    // Navigate to cart page after adding product
    router.push('/cart');
  };

  // Show error message
  if (initialError || !initialProduct) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">{initialError || 'This product could not be found or has been removed.'}</p>
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            asChild
          >
            <Link href="/shop">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-12">
      <div className="mb-4">
        <Button 
          variant="ghost"
          onClick={() => router.back()} 
          className="inline-flex items-center text-sm font-medium"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
        >
          <Image 
            src={initialProduct.image} 
            alt={initialProduct.name} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute top-4 right-4">
            <WishlistButton
              product={{
                id: initialProduct.id || initialProduct._id,
                name: initialProduct.name,
                price: initialProduct.price, 
                image: initialProduct.image
              }}
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col space-y-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{initialProduct.name}</h1>
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(initialProduct.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({initialProduct.numReviews} reviews)
              </span>
              <span className="text-sm font-medium text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                {initialProduct.countInStock} in stock
              </span>
            </div>
          </div>
          
          <div className="text-2xl font-bold">
            {formatPrice(initialProduct.price)}
          </div>
          
          <p className="text-muted-foreground">
            {initialProduct.description}
          </p>
          
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 px-4 text-center">
                {quantity}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={handleQuantityIncrease}
                disabled={initialProduct.countInStock ? quantity >= initialProduct.countInStock : false}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
          
          <div className="my-6 flex items-center space-x-4 rounded-lg border p-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">Delivery within 3-5 business days</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="features"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Features
            </TabsTrigger>
            <TabsTrigger 
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              Specifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <p className="text-muted-foreground">
              {initialProduct.description}
            </p>
          </TabsContent>
          <TabsContent value="features" className="py-4">
            <ul className="space-y-2">
              {initialProduct.features?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 flex h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialProduct.specifications && Object.entries(initialProduct.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{key}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 