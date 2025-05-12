"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { CartItem as CartItemType } from '@/app/models/Cart';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  [key: string]: any;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token, user } = useAuth();
  const { toast } = useToast();
  
  // Load cart from appropriate source (API or localStorage) when authentication state changes
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated && token) {
          // Fetch cart from API for logged-in users
          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Convert API cart items to our format
            if (data.items && Array.isArray(data.items)) {
              const items: CartItem[] = data.items.map((item: CartItemType) => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
              }));
              setCartItems(items);
            } else {
              setCartItems([]);
            }
          } else {
            // If there's an error, fall back to localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              try {
                setCartItems(JSON.parse(savedCart));
              } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                setCartItems([]);
              }
            } else {
              setCartItems([]);
            }
          }
        } else {
          // For non-authenticated users, use localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (error) {
              console.error('Error parsing cart from localStorage:', error);
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: 'Failed to load cart',
          description: 'There was a problem loading your shopping cart.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, [isAuthenticated, token, toast]);
  
  // Save cart to appropriate destination when it changes
  useEffect(() => {
    const saveCart = async () => {
      if (isLoading) return; // Don't save while loading
      
      if (isAuthenticated && token && user) {
        try {
          // Convert our format to API format
          const apiItems = cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          }));
          
          // Save to API
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: apiItems })
          });
        } catch (error) {
          console.error('Error saving cart to API:', error);
          // Still save to localStorage as fallback
          localStorage.setItem('cart', JSON.stringify(cartItems));
        }
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
    };
    
    saveCart();
  }, [cartItems, isAuthenticated, token, user, isLoading]);
  
  const addToCart = (product: Product) => {
    // Get the quantity from the product or default to 1
    const quantityToAdd = product.quantity || 1;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If item exists, replace its quantity with the new one or add to existing quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: quantityToAdd } 
            : item
        );
      } else {
        // Add new item with specified quantity or default to 1
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      }
    });
  };
  
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = async () => {
    setCartItems([]);
    
    // If authenticated, also clear from API
    if (isAuthenticated && token) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error clearing cart on API:', error);
      }
    }
  };
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate the cart subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);
  
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}