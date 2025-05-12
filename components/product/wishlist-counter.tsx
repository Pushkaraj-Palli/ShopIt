"use client";

import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { cn } from '@/lib/utils';

interface WishlistCounterProps {
  className?: string;
  iconSize?: number;
  showEmpty?: boolean;
}

export function WishlistCounter({
  className,
  iconSize = 5,
  showEmpty = true,
}: WishlistCounterProps) {
  const { wishlistItems, isLoading } = useWishlist();
  
  // Don't show counter if there are no items and showEmpty is false
  if (!showEmpty && wishlistItems.length === 0) {
    return null;
  }
  
  // Don't show while loading
  if (isLoading) {
    return null;
  }
  
  // Map icon size to explicit class names
  const sizeClasses = {
    4: 'h-4 w-4',
    5: 'h-5 w-5',
    6: 'h-6 w-6',
  }[iconSize] || 'h-5 w-5'; // Default to h-5 w-5 if size not specified
  
  return (
    <div className={cn("relative", className)}>
      <Heart className={sizeClasses} />
      {wishlistItems.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {wishlistItems.length}
        </span>
      )}
    </div>
  );
} 