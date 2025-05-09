"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus, Share, ShoppingCart, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/cart-context';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/app/lib/utils';

// Define product interface
interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
  description: string;
  // These fields are not in the database but we'll hardcode them for now
  numReviews?: number;
  countInStock?: number;
  features?: string[];
  specifications?: Record<string, string>;
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Add hardcoded fields for now
          setProduct({
            ...data.data,
            numReviews: 12,
            countInStock: 10,
            features: [
              'Premium quality material',
              'Durable and long-lasting',
              'Comfortable design',
              'Easy to maintain',
              'Stylish appearance'
            ],
            specifications: {
              'Material': 'Premium quality',
              'Weight': 'Lightweight',
              'Dimensions': 'Standard size',
              'Warranty': '1 year',
              'Color': 'As shown'
            }
          });
        } else {
          throw new Error(data.message || 'Failed to fetch product');
        }
      } catch (error) {
        setError((error as Error).message);
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (product && product.countInStock && quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} (${quantity}) has been added to your cart`,
      duration: 3000,
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error message
  if (error || !product) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">{error || 'This product could not be found or has been removed.'}</p>
        <Link 
          href="/shop" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-6 md:py-12">
      <div className="mb-4">
        <Link 
          href="/shop" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </Link>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
        >
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover" 
            priority
          />
          <button 
            className="absolute top-4 right-4 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background"
            onClick={() => toast({
              title: "Added to wishlist",
              description: `${product.name} has been added to your wishlist`,
              duration: 3000,
            })}
          >
            <Heart className="h-5 w-5" />
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col space-y-4"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.numReviews} reviews)
              </span>
              <span className="text-sm font-medium text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">
                {product.countInStock} in stock
              </span>
            </div>
          </div>
          
          <div className="text-2xl font-bold">
            {formatPrice(product.price)}
          </div>
          
          <p className="text-muted-foreground">
            {product.description}
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
                disabled={product.countInStock ? quantity >= product.countInStock : false}
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
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
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
              {product.description}
            </p>
          </TabsContent>
          <TabsContent value="features" className="py-4">
            <ul className="space-y-2">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2 flex h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
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