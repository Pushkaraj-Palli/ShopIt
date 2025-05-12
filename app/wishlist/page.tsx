"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/wishlist-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Heart, ShoppingCart, Loader2, MoveRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { formatPrice } from '@/app/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isAddingAll, setIsAddingAll] = useState(false);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-10">
        <div className="mx-auto max-w-3xl py-10 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Loading Your Wishlist</h1>
          <p className="mb-8 text-muted-foreground">
            Please wait while we retrieve your wishlist items...
          </p>
        </div>
      </div>
    );
  }
  
  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container px-4 md:px-6 py-10">
        <div className="mx-auto max-w-3xl py-10 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Sign In to Access Your Wishlist</h1>
          <p className="mb-8 text-muted-foreground">
            Please sign in to view and manage your wishlist items.
          </p>
          <Button size="lg" asChild>
            <Link href="/account/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Show empty wishlist message
  if (wishlistItems.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-10">
        <div className="mx-auto max-w-3xl py-10 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Your Wishlist is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            Hi {user?.name}, you haven't added any products to your wishlist yet.
          </p>
          <Button size="lg" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleAddAllToCart = () => {
    setIsAddingAll(true);
    
    try {
      // Add each item to cart
      wishlistItems.forEach(item => {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1
        });
      });
      
      toast({
        title: "Added all to cart",
        description: `${wishlistItems.length} items have been added to your cart`,
        variant: "default"
      });
      
      // Optional: navigate to cart or keep the user on the wishlist page
      // router.push('/cart');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add all items to cart",
        variant: "destructive"
      });
    } finally {
      setIsAddingAll(false);
    }
  };

  return (
    <div className="container px-4 md:px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <Button 
            onClick={handleAddAllToCart} 
            disabled={isAddingAll}
            className="flex items-center gap-2"
          >
            {isAddingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> 
                Add All to Cart
              </>
            )}
          </Button>
        )}
      </div>
      
      <p className="mb-8 text-muted-foreground">
        Hi {user?.name}, here are the items in your wishlist:
      </p>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence>
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              // @ts-ignore - item is being treated as a variant
              variants={item as any}
              exit="exit"
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image 
                  src={item.image} 
                  alt={item.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <Link 
                  href={`/product/${item.id}`}
                  className="block font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-base font-bold">
                  {formatPrice(item.price)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Added on {item.addedAt.toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button 
                    className="w-full"
                    size="sm"
                    onClick={() => addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      quantity: 1
                    })}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        {wishlistItems.length > 0 && (
          <Button variant="default" asChild>
            <Link href="/cart" className="flex items-center gap-2">
              <span>Go to Cart</span>
              <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 