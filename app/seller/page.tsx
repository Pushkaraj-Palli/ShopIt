import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SellerDashboardPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Seller workspace</p>
      <h1 className="mt-2 text-3xl font-bold">Seller dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage your catalogue and submit products for review.</p>
      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Products</h2>
        <p className="mt-2 text-muted-foreground">Create listings, update pricing and stock, and track moderation status.</p>
        <Button asChild className="mt-5"><Link href="/seller/products">Manage products</Link></Button>
      </div>
    </main>
  );
}
