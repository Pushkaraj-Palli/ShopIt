"use client";

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';

type ProductForReview = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sku: string;
  tags: string[];
  image: string;
  stockQty: number | null;
  createdAt: string;
  seller: { id: string; name: string; email: string } | null;
};

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductForReview[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/products', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load products for review');
      setProducts(data.products);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load products for review');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const reviewProduct = async (productId: string, decision: 'approve' | 'reject') => {
    const reason = reasons[productId]?.trim();
    if (decision === 'reject' && (!reason || reason.length < 3)) {
      setErrorMessage('Add a rejection reason of at least 3 characters.');
      return;
    }

    setActingOn(productId);
    setErrorMessage('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ decision, ...(decision === 'reject' ? { reason } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not review product');
      setProducts((current) => current.filter((product) => product.id !== productId));
      setNotice(decision === 'approve' ? 'Product approved and now visible in the public catalogue.' : 'Product rejected. The seller can edit it and resubmit for review.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not review product');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="text-3xl font-bold">Product moderation</h1>
          <p className="mt-2 text-muted-foreground">Approve seller submissions before they appear in the public catalogue.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadProducts()} disabled={loading} data-testid="refresh-product-review-queue">Refresh queue</Button>
      </div>

      {errorMessage && <p role="alert" className="mb-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p>}
      {notice && <p role="status" className="mb-5 rounded-md bg-primary/10 p-3 text-sm" data-testid="product-review-notice">{notice}</p>}
      {loading ? (
        <p data-testid="loading" aria-busy="true" className="text-muted-foreground">Loading product reviews…</p>
      ) : products.length === 0 ? (
        <p className="rounded-lg border p-8 text-center text-muted-foreground" data-testid="product-review-empty">There are no products awaiting review.</p>
      ) : (
        <div className="space-y-5" data-testid="product-review-list">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border p-6" data-testid="product-review-card">
              <div className="flex flex-wrap gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt="" className="h-28 w-28 rounded-md object-cover" />
                <div className="min-w-48 flex-1">
                  <h2 className="text-xl font-semibold" data-testid="product-review-title">{product.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">₹{product.price.toLocaleString('en-IN')} · {product.category}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Seller: {product.seller?.name ?? 'Unknown'} ({product.seller?.email ?? 'account unavailable'})</p>
                  <p className="mt-1 text-sm text-muted-foreground">Submitted {new Date(product.createdAt).toLocaleDateString()} · Stock {product.stockQty ?? 'not tracked'}</p>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm">{product.description}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="font-medium">Brand</dt><dd className="text-muted-foreground">{product.brand || 'Not provided'}</dd></div>
                <div><dt className="font-medium">SKU</dt><dd className="text-muted-foreground">{product.sku || 'Not provided'}</dd></div>
                <div><dt className="font-medium">Tags</dt><dd className="text-muted-foreground">{product.tags.join(', ') || 'None'}</dd></div>
              </dl>
              <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full space-y-2 sm:max-w-md">
                  <Label htmlFor={`product-rejection-${product.id}`}>Rejection reason</Label>
                  <Textarea
                    id={`product-rejection-${product.id}`}
                    data-testid="product-rejection-reason"
                    value={reasons[product.id] ?? ''}
                    onChange={(event) => setReasons((current) => ({ ...current, [product.id]: event.target.value }))}
                    maxLength={500}
                    placeholder="Explain what needs to change"
                    disabled={actingOn === product.id}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" data-testid="reject-product" onClick={() => void reviewProduct(product.id, 'reject')} disabled={actingOn === product.id}>Reject</Button>
                  <Button type="button" data-testid="approve-product" onClick={() => void reviewProduct(product.id, 'approve')} disabled={actingOn === product.id}>
                    {actingOn === product.id ? 'Saving…' : 'Approve product'}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
