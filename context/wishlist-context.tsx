"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { WishlistItem as WishlistItemType } from '@/app/models/Wishlist';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  [key: string]: any;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: Date;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  
  // Load wishlist when authentication state changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated || !token) {
        setWishlistItems([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert API wishlist items to our format
          if (data.items && Array.isArray(data.items)) {
            const items: WishlistItem[] = data.items.map((item: WishlistItemType) => ({
              id: item.productId,
              name: item.name,
              price: item.price,
              image: item.image,
              addedAt: new Date(item.addedAt)
            }));
            setWishlistItems(items);
          } else {
            setWishlistItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast({
          title: 'Failed to load wishlist',
          description: 'There was a problem loading your wishlist.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWishlist();
  }, [isAuthenticated, token, toast]);
  
  // Add a product to the wishlist
  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'default'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add item to local state if it's not already in the wishlist
        if (!isInWishlist(product.id)) {
          setWishlistItems(prev => [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              addedAt: new Date()
            }
          ]);
        }
        
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist.`,
          variant: 'default'
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to wishlist');
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: 'Failed to add to wishlist',
        description: error.message || 'There was a problem adding to your wishlist.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a product from the wishlist
  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove item from local state
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        
        toast({
          title: 'Removed from wishlist',
          description: 'Item has been removed from your wishlist.',
          variant: 'default'
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from wishlist');
      }
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Failed to remove from wishlist',
        description: error.message || 'There was a problem removing from your wishlist.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };
  
  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 