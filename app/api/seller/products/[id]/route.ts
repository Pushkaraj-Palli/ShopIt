import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/app/models/Product';
import Category from '@/app/models/Category';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';
import { sellerProductInputSchema } from '@/app/lib/validations/seller-product';

function ownershipFilter(id: string, userId: string, isAdmin: boolean) {
  return isAdmin ? { _id: id } : { _id: id, sellerId: userId };
}

function formatProduct(product: any) {
  const basePrice = product.basePrice ?? Math.round(product.price * 100);
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: basePrice / 100,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    categorySlug: product.categorySlug,
    subCategory: product.subCategory,
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    tags: product.tags ?? [],
    image: product.image,
    stockQty: product.stockQty ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    allowBackorders: product.allowBackorders ?? false,
    status: product.status,
    hasVariants: product.hasVariants,
    variants: product.variants ?? [],
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['retailer', 'admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  try {
    const product = await Product.findOne(ownershipFilter(params.id, auth.user.id, auth.user.role === 'admin'));
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: formatProduct(product) });
  } catch (error) {
    console.error('Seller product lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['retailer', 'admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = sellerProductInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the product details', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const category = await Category.findOne({ slug: parsed.data.categorySlug }).select('name slug');
    if (!category) return NextResponse.json({ error: 'Select a valid category' }, { status: 400 });

    const basePrice = parsed.data.hasVariants
      ? Math.min(...parsed.data.variants.map((variant) => variant.price))
      : parsed.data.price!;
    const variantStock = parsed.data.hasVariants
      ? parsed.data.variants.reduce((total, variant) => total + variant.stockQty, 0)
      : parsed.data.stockQty;
    if (!Number.isSafeInteger(variantStock)) {
      return NextResponse.json({ error: 'Combined variant stock exceeds the supported range' }, { status: 400 });
    }

    const status = auth.user.role === 'admin' ? undefined : 'pending_review';
    const update: Record<string, unknown> = {
      name: parsed.data.name,
      description: parsed.data.description,
      price: basePrice / 100,
      basePrice,
      compareAtPrice: parsed.data.compareAtPrice,
      category: category.name,
      categorySlug: category.slug,
      subCategory: parsed.data.subCategory,
      brand: parsed.data.brand,
      sku: parsed.data.sku,
      tags: parsed.data.tags,
      image: parsed.data.image,
      images: [parsed.data.image],
      stockQty: variantStock,
      trackInventory: true,
      lowStockThreshold: parsed.data.lowStockThreshold,
      allowBackorders: parsed.data.allowBackorders,
      hasVariants: parsed.data.hasVariants,
      variants: parsed.data.hasVariants ? parsed.data.variants : [],
    };
    if (status) update.status = status;
    const updateDocument: { $set: Record<string, unknown>; $unset?: Record<string, 1> } = { $set: update };
    if (parsed.data.compareAtPrice === undefined) updateDocument.$unset = { compareAtPrice: 1 };

    const product = await Product.findOneAndUpdate(
      ownershipFilter(params.id, auth.user.id, auth.user.role === 'admin'),
      updateDocument,
      { new: true, runValidators: true },
    );
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product: formatProduct(product) });
  } catch (error) {
    console.error('Seller product update failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['retailer', 'admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  try {
    const product = await Product.findOneAndUpdate(
      ownershipFilter(params.id, auth.user.id, auth.user.role === 'admin'),
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, status: product.status });
  } catch (error) {
    console.error('Seller product archive failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not archive product' }, { status: 500 });
  }
}
