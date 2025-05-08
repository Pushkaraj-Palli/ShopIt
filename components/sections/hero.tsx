"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const imageVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    },
  };

  return (
    <section className="relative overflow-hidden bg-background pt-8 pb-16 md:pb-20 lg:pt-16 lg:pb-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <motion.div 
            className="flex flex-col justify-center space-y-4 md:space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                New Collection
              </span>
            </motion.div>
            <motion.h1 
              variants={item}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none"
            >
              Elevate Your Style with Premium Quality
            </motion.h1>
            <motion.p 
              variants={item}
              className="max-w-[600px] text-muted-foreground md:text-xl"
            >
              Discover our curated collection of premium products designed to enhance your lifestyle with elegance and functionality.
            </motion.p>
            <motion.div 
              variants={item}
              className="flex flex-col gap-3 min-[400px]:flex-row"
            >
              <Button size="lg" asChild>
                <Link href="/shop">
                  Shop Now <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">Explore Categories</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="flex items-center justify-center"
            variants={imageVariant}
            initial="hidden"
            animate="show"
          >
            <div className="relative h-[350px] w-full sm:h-[450px] lg:h-[550px] rounded-xl overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/5868722/pexels-photo-5868722.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Premium products showcase"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}