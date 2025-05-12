"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QuickAuth } from '@/components/layout/quick-auth';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, X } from 'lucide-react';

export function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Check if user has previously dismissed the message
  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('welcome_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-primary/10 border-b py-2"
    >
      <div className="container flex items-center justify-between px-4">
        <p className="text-sm text-foreground">
          Welcome to ShopIt! Sign in to access your order history and personalized recommendations.
        </p>
        <div className="flex items-center gap-3">
          <QuickAuth>
            <Button size="sm" variant="ghost" className="flex items-center gap-1">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline-block">Sign In</span>
            </Button>
          </QuickAuth>
          <Button size="sm" variant="ghost" onClick={handleDismiss} className="p-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 