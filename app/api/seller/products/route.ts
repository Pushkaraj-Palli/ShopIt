import { NextRequest, NextResponse } from 'next/server';
import Product from '@/app/models/Product';
import Category from '@/app/models/Category';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';
import { sellerProductInputSchema } from '@/app/lib/validations/seller-product';

function productResponse(product: any) {
  const basePrice = product.basePrice ?? Math.round(product.price * 100);
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: basePrice / 100,
    basePrice,
    compareAtPrice: product.compareAtPrice,
    currency: product.currency ?? 'INR',
    category: product.category,
    categorySlug: product.categorySlug,
    subCategory: product.subCategory,
    rating: product.rating,
    image: product.image,
    images: product.images?.length ? product.images : [product.image],
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    tags: product.tags ?? [],
    stockQty: product.stockQty,
    trackInventory: product.trackInventory,
    lowStockThreshold: product.lowStockThreshold,
    allowBackorders: product.allowBackorders,
    hasVariants: product.hasVariants,
    variants: product.variants ?? [],
    status: product.status,
    sellerId: product.sellerId?.toString() ?? null,
    updatedAt: product.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['retailer', 'admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

  try {
    const filter = auth.user.role === 'admin' ? {} : { sellerId: auth.user.id };
    const products = await Product.find(filter).sort({ updatedAt: -1 }).limit(100);
    return NextResponse.json({ products: products.map(productResponse) });
  } catch (error) {
    console.error('Seller product list failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['retailer', 'admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

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

    const product = await Product.create({
      sellerId: auth.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      price: basePrice / 100,
      basePrice,
      compareAtPrice: parsed.data.compareAtPrice,
      currency: 'INR',
      category: category.name,
      categorySlug: category.slug,
      subCategory: parsed.data.subCategory,
      brand: parsed.data.brand,
      sku: parsed.data.sku,
      tags: parsed.data.tags,
      image: parsed.data.image,
      images: [parsed.data.image],
      status: 'pending_review',
      stockQty: variantStock,
      trackInventory: true,
      lowStockThreshold: parsed.data.lowStockThreshold,
      allowBackorders: parsed.data.allowBackorders,
      hasVariants: parsed.data.hasVariants,
      variants: parsed.data.hasVariants ? parsed.data.variants : [],
    });

    return NextResponse.json({ product: productResponse(product) }, { status: 201 });
  } catch (error) {
    console.error('Seller product creation failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not create product' }, { status: 500 });
  }
}
