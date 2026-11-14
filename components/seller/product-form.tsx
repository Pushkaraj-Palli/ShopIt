"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.string().trim().regex(/^\d{1,8}(\.\d{1,2})?$/, 'Use INR with up to two decimal places').refine((value) => Number(value) > 0, 'Price must be greater than zero'),
  compareAtPrice: z.string().trim().regex(/^$|^\d{1,8}(\.\d{1,2})?$/, 'Use INR with up to two decimal places'),
  categorySlug: z.string().min(1, 'Select a category'),
  subCategory: z.string().trim().max(100),
  brand: z.string().trim().max(100),
  sku: z.string().trim().max(80),
  image: z.string().trim().min(1, 'Provide an image URL or local path').max(1000)
    .refine((value) => (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value), 'Use a secure image URL or local path'),
  tags: z.string().max(600),
  stockQty: z.string().regex(/^\d{1,10}$/, 'Enter a whole stock quantity'),
  lowStockThreshold: z.string().regex(/^\d{1,10}$/, 'Enter a whole number'),
  allowBackorders: z.boolean(),
}).superRefine((values, context) => {
  if (values.compareAtPrice && Number(values.compareAtPrice) <= Number(values.price)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['compareAtPrice'], message: 'Compare-at price must be higher than the selling price' });
  }
});

type FormValues = z.infer<typeof formSchema>;
type ProductCategory = { name: string; slug: string; subCategories: string[] };

const emptyValues: FormValues = {
  name: '', description: '', price: '', compareAtPrice: '', categorySlug: '',
  subCategory: '', brand: '', sku: '', image: '', tags: '', stockQty: '0',
  lowStockThreshold: '5', allowBackorders: false,
};

export function SellerProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let active = true;
    const loadFormData = async () => {
      try {
        const categoriesResponse = await fetch('/api/categories', { cache: 'no-store' });
        const categoriesData = await categoriesResponse.json();
        if (!categoriesResponse.ok) throw new Error('Could not load categories');
        if (active) setCategories(categoriesData.data ?? []);

        if (productId) {
          const response = await fetch(`/api/seller/products/${productId}`, {
            cache: 'no-store',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Could not load product');
          if (active) reset({
            ...emptyValues,
            name: data.product.name,
            description: data.product.description,
            price: String(data.product.price),
            compareAtPrice: data.product.compareAtPrice ? String(data.product.compareAtPrice / 100) : '',
            categorySlug: data.product.categorySlug,
            subCategory: data.product.subCategory ?? '',
            brand: data.product.brand ?? '',
            sku: data.product.sku ?? '',
            image: data.product.image,
            tags: (data.product.tags ?? []).join(', '),
            stockQty: String(data.product.stockQty ?? 0),
            lowStockThreshold: String(data.product.lowStockThreshold ?? 5),
            allowBackorders: Boolean(data.product.allowBackorders),
          });
        }
      } catch (error) {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Could not load product form');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadFormData();
    return () => { active = false; };
  }, [productId, reset, token]);

  const saveProduct = async (values: FormValues) => {
    setSaving(true);
    setErrorMessage('');
    const payload = {
      ...values,
      stockQty: Number(values.stockQty),
      lowStockThreshold: Number(values.lowStockThreshold),
      tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };
    try {
      const response = await fetch(productId ? `/api/seller/products/${productId}` : '/api/seller/products', {
        method: productId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save product');
      router.push('/seller/products');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="container mx-auto max-w-3xl px-4 py-12" aria-busy="true" data-testid="loading">Loading product…</p>;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Link href="/seller/products" className="text-sm text-primary hover:underline">← Back to products</Link>
        <h1 className="mt-3 text-3xl font-bold">{productId ? 'Edit product' : 'Add a product'}</h1>
        <p className="mt-2 text-muted-foreground">Seller listings and seller edits require admin approval before publication.</p>
      </div>

      <form data-testid="seller-product-form" onSubmit={handleSubmit(saveProduct)} className="space-y-5 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="productName">Product name</Label>
          <Input id="productName" data-testid="retailer-product-title" {...register('name')} disabled={saving} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="productDescription">Description</Label>
          <Textarea id="productDescription" {...register('description')} disabled={saving} />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productCategory">Category</Label>
            <select id="productCategory" data-testid="retailer-product-category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register('categorySlug')} disabled={saving}>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
            {errors.categorySlug && <p className="text-sm text-destructive">{errors.categorySlug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productSubCategory">Subcategory</Label>
            <Input id="productSubCategory" {...register('subCategory')} disabled={saving} />
            {errors.subCategory && <p className="text-sm text-destructive">{errors.subCategory.message}</p>}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productPrice">Price (INR)</Label>
            <Input id="productPrice" data-testid="retailer-product-price" type="number" min="0.01" step="0.01" {...register('price')} disabled={saving} />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productCompareAtPrice">Compare-at price (INR, optional)</Label>
            <Input id="productCompareAtPrice" type="number" min="0.01" step="0.01" {...register('compareAtPrice')} disabled={saving} />
            {errors.compareAtPrice && <p className="text-sm text-destructive">{errors.compareAtPrice.message}</p>}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productStock">Stock quantity</Label>
            <Input id="productStock" data-testid="retailer-product-stock" type="number" min="0" step="1" {...register('stockQty')} disabled={saving} />
            {errors.stockQty && <p className="text-sm text-destructive">{errors.stockQty.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
            <Input id="lowStockThreshold" type="number" min="0" step="1" {...register('lowStockThreshold')} disabled={saving} />
            {errors.lowStockThreshold && <p className="text-sm text-destructive">{errors.lowStockThreshold.message}</p>}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="productBrand">Brand</Label>
            <Input id="productBrand" {...register('brand')} disabled={saving} />
            {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="productSku">SKU</Label>
            <Input id="productSku" {...register('sku')} disabled={saving} />
            {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="productImage">Primary image URL or local path</Label>
          <Input id="productImage" data-testid="retailer-product-image" type="text" placeholder="https://… or /products/image.jpg" {...register('image')} disabled={saving} />
          <p className="text-xs text-muted-foreground">Image uploads and galleries will be added with the storage integration.</p>
          {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="productTags">Tags <span className="font-normal text-muted-foreground">(comma separated)</span></Label>
          <Input id="productTags" {...register('tags')} disabled={saving} />
          {errors.tags && <p className="text-sm text-destructive">{errors.tags.message}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" data-testid="retailer-allow-backorders" className="h-4 w-4" {...register('allowBackorders')} disabled={saving} />
          Allow backorders
        </label>
        {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
        <Button type="submit" data-testid="retailer-product-save" disabled={saving}>
          {saving ? 'Saving…' : productId ? 'Save changes for review' : 'Submit product for review'}
        </Button>
      </form>
    </main>
  );
}
