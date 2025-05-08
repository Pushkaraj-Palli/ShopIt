"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
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
  
  if (cartItems.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-10">
        <div className="mx-auto max-w-3xl py-10 text-center">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold">Your Cart is Empty</h1>
          <p className="mb-8 text-muted-foreground">
            Looks like you haven't added any products to your cart yet.
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
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="grid grid-cols-1 gap-4 border-t py-4 md:grid-cols-6 md:px-4"
                  >
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link 
                            href={`/product/${item.id}`}
                            className="font-medium hover:underline"
                          >
                            {item.name}
                          </Link>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {item.category}
                          </div>
                          <div className="mt-2 text-sm font-medium md:hidden">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden items-center text-base md:flex">
                      ${item.price.toFixed(2)}
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
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="hidden text-base font-medium md:block">
                        ${(item.price * item.quantity).toFixed(2)}
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
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{subtotal > 100 ? "Free" : "$10.00"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(subtotal * 0.1).toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    ${(
                      subtotal + 
                      (subtotal > 100 ? 0 : 10) + 
                      subtotal * 0.1
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button 
                className="mt-6 w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  "Processing..."
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                We accept credit cards, PayPal, and bank transfers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}