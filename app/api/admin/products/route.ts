import { NextRequest, NextResponse } from 'next/server';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';
import Product from '@/app/models/Product';
import type { IProductVariant } from '@/app/models/Product';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

  try {
    const products = await Product.find({ status: 'pending_review' })
      .sort({ updatedAt: 1 })
      .limit(100)
      .populate('sellerId', 'name email');

    return NextResponse.json({
      products: products.map((product) => {
        const seller = product.sellerId as unknown as { _id: { toString(): string }; name: string; email: string } | null;
        const data = product.toObject();
        return {
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.basePrice !== undefined ? product.basePrice / 100 : product.price,
          compareAtPrice: product.compareAtPrice,
          category: product.category,
          brand: product.brand ?? '',
          sku: product.sku ?? '',
          tags: product.tags ?? [],
          image: product.image,
          stockQty: product.stockQty,
          variants: product.variants.map((variant: IProductVariant) => ({
            id: variant._id?.toString(),
            sku: variant.sku,
            options: variant.options,
            price: variant.price / 100,
            stockQty: variant.stockQty,
          })),
          createdAt: product.createdAt,
          seller: seller ? { id: seller._id.toString(), name: seller.name, email: seller.email } : null,
          rejectionReason: data.rejectionReason ?? '',
        };
      }),
    });
  } catch (error) {
    console.error('Admin product moderation queue failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load products for review' }, { status: 500 });
  }
}
