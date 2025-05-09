"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { formatPrice } from '@/app/lib/utils';
import { products as fallbackProducts } from '@/app/lib/data';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categorySlug?: string;
  image: string;
  description?: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ isOpen, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Clear results when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setError('');
      setUsingFallback(false);
    }
  }, [isOpen]);
  
  // Client-side search as fallback
  const searchProductsClientSide = (term: string) => {
    const searchLower = term.toLowerCase();
    return fallbackProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      product.description.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  };
  
  // Perform search when term changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        setError('');
        setUsingFallback(false);
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch products from API
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.products) {
          setResults(data.products.slice(0, 5)); // Limit to 5 results initially
          console.log(`Found ${data.products.length} products for search: "${searchTerm}"`);
          setUsingFallback(false);
        } else {
          setResults([]);
          console.log(`No products found for search: "${searchTerm}"`);
          setUsingFallback(false);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        // Use client-side search as fallback
        console.log('Using client-side search as fallback');
        const fallbackResults = searchProductsClientSide(searchTerm);
        setResults(fallbackResults);
        setUsingFallback(true);
        if (fallbackResults.length === 0) {
          setError('No products found matching your search.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleProductClick = (product: Product) => {
    onOpenChange(false);
    router.push(`/product/${product.id}`);
  };
  
  const handleViewAllResults = () => {
    onOpenChange(false);
    router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.length >= 2) {
      e.preventDefault();
      onOpenChange(false);
      router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-4 pt-5 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for products..."
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="px-4 py-4 max-h-[60vh] overflow-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {usingFallback && searchTerm.length >= 2 && !error && (
            <Alert className="mb-4">
              <AlertDescription>Using sample data - some products may not be available.</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                searchTerm.length > 1 && !isLoading && !error && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No products found matching "{searchTerm}"</p>
                  </div>
                )
              )}
            </>
          )}
        </div>
        
        {results.length > 0 && (
          <DialogFooter className="px-4 py-3 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleViewAllResults}
            >
              View all results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 