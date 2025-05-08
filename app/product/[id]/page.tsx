"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus, Share, ShoppingCart, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/cart-context';
import { toast } from '@/components/ui/use-toast';

// Mock data - would be fetched from API in a real scenario
const products = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 249.99,
    category: 'Electronics',
    rating: 4.8,
    numReviews: 12,
    countInStock: 10,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience unparalleled sound quality with our premium wireless headphones. These headphones feature active noise cancellation, premium audio drivers, and a comfortable over-ear design for extended listening sessions. Enjoy up to 30 hours of battery life on a single charge. Connect seamlessly via Bluetooth 5.0 or use the included 3.5mm audio cable for wired listening.',
    features: [
      'Active noise cancellation technology',
      'Premium audio drivers for exceptional sound',
      '30-hour battery life',
      'Comfortable over-ear design',
      'Bluetooth 5.0 connectivity',
      'Includes travel case and accessories'
    ],
    specifications: {
      'Driver Size': '40mm',
      'Frequency Response': '20Hz - 20kHz',
      'Impedance': '32 Ohms',
      'Battery Life': '30 hours',
      'Charging Time': '2.5 hours',
      'Weight': '250g'
    },
    images: [
      'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3394651/pexels-photo-3394651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ]
  }
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    notFound();
  }
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { addToCart } = useCart();
  
  const incrementQuantity = () => {
    if (quantity < product.countInStock) {
      setQuantity(quantity + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    const item = { ...product, quantity };
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 3000,
    });
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your wishlist`,
      duration: 3000,
    });
  };
  
  return (
    <div className="container px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6">
        <Link href="/shop" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Image 
                src={selectedImage} 
                alt={product.name} 
                fill 
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
          
          <div className="mt-4 flex space-x-2 overflow-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`relative min-w-[80px] overflow-hidden rounded border-2 transition-all ${
                  selectedImage === image ? 'border-primary' : 'border-transparent'
                }`}
              >
                <div className="aspect-square h-20 w-20">
                  <Image 
                    src={image} 
                    alt={`${product.name} ${index}`} 
                    fill 
                    className="object-cover" 
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-primary text-primary'
                        : i < product.rating
                        ? 'fill-primary/50 text-primary'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium">
                {product.rating} ({product.numReviews} reviews)
              </span>
            </div>
          </div>
          
          <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground">Availability:</div>
              <div className="ml-2 text-sm font-medium">
                {product.countInStock > 0 ? (
                  <span className="text-green-600">In Stock ({product.countInStock} available)</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground">Category:</div>
              <div className="ml-2 text-sm font-medium">{product.category}</div>
            </div>
            
            <div className="flex items-center">
              <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Free shipping for orders over $100
              </span>
            </div>
          </div>
          
          <div className="space-y-4 border-t border-b py-6">
            <div className="flex items-center">
              <div className="text-sm font-medium">Quantity:</div>
              <div className="ml-4 flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center">{quantity}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.countInStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={toggleFavorite}
              >
                <Heart 
                  className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
                />
                Wishlist
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12"
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <p className="text-muted-foreground">{product.description}</p>
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="specifications" className="pt-4">
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border pb-2">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}