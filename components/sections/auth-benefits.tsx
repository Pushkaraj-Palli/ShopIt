"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Heart, UserCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function AuthBenefits() {
  const router = useRouter();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const benefits = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Order History",
      description: "Track all your purchases and view order details easily"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Wishlist",
      description: "Save your favorite items to buy later"
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Faster Checkout",
      description: "Save your shipping and payment details for quick shopping"
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "Exclusive Offers",
      description: "Get access to member-only discounts and early sales"
    }
  ];
  
  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/account/login');
  };
  
  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/account/register');
  };

  return (
    <section className="py-12 bg-muted/50">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center mb-10 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight">Create Your Account Today</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers and enjoy a personalized shopping experience
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              variants={item}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button size="lg" onClick={handleRegister}>
            Create an Account
          </Button>
          <Button size="lg" variant="outline" onClick={handleSignIn}>
            Sign In
          </Button>
        </motion.div>
      </div>
    </section>
  );
} 