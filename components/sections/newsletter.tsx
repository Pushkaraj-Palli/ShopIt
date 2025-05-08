"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

export function Newsletter() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    // This would connect to your API in a real implementation
    console.log('Submitted email:', data.email);
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
      duration: 3000,
    });
    reset();
  };

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Stay Updated with Our Latest Products
          </h2>
          <p className="mt-4 text-primary-foreground/80 md:text-lg">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and more.
          </p>
          
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300 text-left">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-12 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Subscribe
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-primary-foreground/60">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}