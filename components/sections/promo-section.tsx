"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function PromoSection() {
  return (
    <section className="container px-4 md:px-6 py-8 md:py-12">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl overflow-hidden"
        >
          <Link href="/collections/summer" className="group block">
            <div className="relative aspect-[6/4] lg:aspect-auto lg:h-full w-full overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/2901581/pexels-photo-2901581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Summer Collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 group-hover:from-black/70"></div>
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
                <h3 className="text-2xl font-bold text-white md:text-3xl max-w-xs">Summer Collection: Up to 40% Off</h3>
                <p className="mt-2 max-w-xs text-white/80 text-sm md:text-base">
                  Beat the heat with our latest summer styles and essentials.
                </p>
                <Button 
                  className="mt-4 max-w-[180px] bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <div>
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Button>
              </div>
            </div>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl overflow-hidden"
        >
          <Link href="/collections/premium" className="group block">
            <div className="relative aspect-[6/4] lg:aspect-auto lg:h-full w-full overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/4109139/pexels-photo-4109139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Premium Collection"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 group-hover:from-black/70"></div>
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
                <h3 className="text-2xl font-bold text-white md:text-3xl max-w-xs">Premium Selection: Luxury Items</h3>
                <p className="mt-2 max-w-xs text-white/80 text-sm md:text-base">
                  Discover our curated collection of premium products for the discerning shopper.
                </p>
                <Button 
                  className="mt-4 max-w-[180px] bg-white text-black hover:bg-white/90"
                  asChild
                >
                  <div>
                    Explore Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Button>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}