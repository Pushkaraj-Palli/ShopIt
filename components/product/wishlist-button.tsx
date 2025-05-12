"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/wishlist-context';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    [key: string]: any;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function WishlistButton({
  product,
  variant = 'outline',
  size = 'icon',
  className,
  showText = false,
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      // If not authenticated, don't allow adding to wishlist
      return;
    }
    
    setLocalLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } finally {
      setLocalLoading(false);
    }
  };
  
  return (
    <Button
      variant={inWishlist ? 'ghost' : variant}
      size={size}
      className={cn(
        className,
        inWishlist && "text-red-500 hover:text-red-600"
      )}
      onClick={handleToggleWishlist}
      disabled={isLoading || localLoading}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn(
        "h-4 w-4",
        inWishlist ? "fill-red-500 text-red-500" : "fill-none",
        showText && "mr-2"
      )} />
      {showText && (inWishlist ? "Remove from Wishlist" : "Add to Wishlist")}
    </Button>
  );
} 