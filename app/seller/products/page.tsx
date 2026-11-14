"use client";

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

type SellerProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  status: string;
  stockQty: number | null;
};

export default function SellerProductsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProducts = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/seller/products', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load products');
      setProducts(data.products);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load products');
    } finally {
      setLoading(false);
    }
  }, [authLoading, token]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const archiveProduct = async (productId: string) => {
    setBusyId(productId);
    setErrorMessage('');
    setMessage('');
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not archive product');
      setProducts((current) => current.map((product) => product.id === productId ? { ...product, status: 'archived' } : product));
      setMessage('Product archived. It is no longer visible in the public catalogue.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not archive product');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Seller workspace</p>
          <h1 className="text-3xl font-bold">Your products</h1>
          <p className="mt-2 text-muted-foreground">Seller changes are sent to admin review before publication.</p>
        </div>
        <Button asChild><Link href="/seller/products/new">Add product</Link></Button>
      </div>

      {errorMessage && <p role="alert" className="mb-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p>}
      {message && <p role="status" className="mb-5 rounded-md bg-primary/10 p-3 text-sm">{message}</p>}
      {loading ? (
        <p data-testid="loading" aria-busy="true" className="text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border p-8 text-center" data-testid="seller-products-empty">
          <p className="text-muted-foreground">You haven’t added any products yet.</p>
          <Button asChild className="mt-4"><Link href="/seller/products/new">Create your first product</Link></Button>
        </div>
      ) : (
        <div className="space-y-4" data-testid="seller-products-list">
          {products.map((product) => (
            <article key={product.id} className="flex flex-wrap items-center gap-4 rounded-lg border p-4" data-testid="seller-product-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" className="h-20 w-20 rounded-md object-cover" />
              <div className="min-w-48 flex-1">
                <h2 className="font-semibold" data-testid="seller-product-title">{product.name}</h2>
                <p className="text-sm text-muted-foreground">{product.category} · ₹{product.price.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Stock: {product.stockQty ?? 'Not tracked'} · <span className="capitalize">{product.status.replace('_', ' ')}</span></p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm"><Link href={`/seller/products/${product.id}/edit`}>Edit</Link></Button>
                {product.status !== 'archived' && (
                  <Button type="button" variant="outline" size="sm" data-testid="archive-seller-product" disabled={busyId === product.id} onClick={() => void archiveProduct(product.id)}>
                    {busyId === product.id ? 'Archiving…' : 'Archive'}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
