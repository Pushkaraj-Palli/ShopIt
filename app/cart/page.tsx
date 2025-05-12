"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/app/lib/utils';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, isLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // In a real app, you would redirect to checkout page
    setTimeout(() => {
      setIsCheckingOut(false);
    }, 2000);
  };
  
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
          <h1 className="mb-4 text-3xl font-bold">Loading Your Cart</h1>
          <p className="mb-8 text-muted-foreground">
            Please wait while we retrieve your cart items...
          </p>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-10">
        <div className="mx-auto max-w-3xl py-10 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            {isAuthenticated && user
              ? `Hi ${user.name}, you haven't added any products to your cart yet.`
              : "Looks like you haven't added any products to your cart yet."}
          </p>
          <Button size="lg" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 md:px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
      
      {isAuthenticated && user && (
        <p className="mb-4 text-muted-foreground">
          Hi {user.name}, here are the items in your cart:
        </p>
      )}
      
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="rounded-lg border bg-card"
          >
            <div className="p-6">
              <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:px-4 md:pb-2 md:text-sm md:font-medium">
                <div className="md:col-span-3">Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
              </div>
              
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={item}
                    exit="exit"
                    className="grid grid-cols-2 gap-4 border-t py-4 md:grid-cols-6 md:px-4"
                  >
                    <div className="col-span-2 flex items-center gap-4 md:col-span-3">
                      <div className="relative aspect-square h-16 w-16 min-w-[4rem] overflow-hidden rounded-md border bg-muted">
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden items-center text-base md:flex">
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center md:w-28">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-10 text-center">{item.quantity}</div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 flex md:hidden"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-between">
                      <div className="text-base font-medium md:hidden">
                        Total: {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="hidden text-base font-medium md:block">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="flex justify-between border-t p-6">
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <Button variant="outline" onClick={() => clearCart()}>
                Clear Cart
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-medium">Order Summary</h2>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Button 
              className="mt-6 w-full" 
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Checkout <ArrowRight className="ml-2 h-4 w-4" /> 
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                <p>Sign in to save your cart and access it from any device.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 