import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Cart from '@/app/models/Cart';
import Product from '@/app/models/Product';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';
import { publicProductQuery } from '@/app/lib/product-queries';
import { z } from 'zod';

const cartInputSchema = z.object({
  items: z.array(z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i),
    variantId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    quantity: z.number().int().min(1).max(999),
  }).strict()).max(100),
}).strict();

function productPrice(product: any, variant?: any) {
  const priceInPaise = variant?.price ?? product.basePrice ?? Math.round(product.price * 100);
  return priceInPaise / 100;
}

function resolveVariant(product: any, variantId?: string) {
  if (!product.hasVariants) return variantId ? null : undefined;
  if (!variantId) return null;
  return product.variants.find((variant: any) => variant._id.toString() === variantId) ?? null;
}

// GET /api/cart - Get the current user's cart
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const auth = await requireRole(request, ['customer', 'retailer', 'admin']);
    if (!auth.user) return authorizationErrorResponse(auth.error);
    const userId = auth.user.id;

    await connectToDatabase();
    
    const cart = await Cart.findOne({ user: userId });
    
    // If no cart exists, return empty cart
    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    const productIds = [...new Set(cart.items.map((item) => item.productId))];
    const products = await Product.find(publicProductQuery({ _id: { $in: productIds } }));
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const refreshedItems = cart.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return { ...item.toObject(), isAvailable: false, availableStock: 0 };

      const variant = resolveVariant(product, item.variantId);
      if (variant === null) return { ...item.toObject(), isAvailable: false, availableStock: 0 };

      const availableStock = product.trackInventory && !product.allowBackorders
        ? (variant ? variant.stockQty : product.stockQty ?? 0)
        : null;
      return {
        ...item.toObject(),
        name: product.name,
        price: productPrice(product, variant),
        image: variant?.image || product.image,
        variantSku: variant?.sku,
        variantOptions: variant?.options,
        availableStock,
        isAvailable: availableStock === null || availableStock > 0,
      };
    });
    cart.items = refreshedItems as typeof cart.items;
    await cart.save();
    return NextResponse.json({ items: refreshedItems });
  } catch (error: any) {
    console.error('Error fetching cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Update the user's cart
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const auth = await requireRole(request, ['customer', 'retailer', 'admin']);
    if (!auth.user) return authorizationErrorResponse(auth.error);
    const userId = auth.user.id;

    await connectToDatabase();
    
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = cartInputSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid cart data', details: parsed.error.flatten().fieldErrors }, { status: 400 });

    const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];
    const products = await Product.find(publicProductQuery({ _id: { $in: productIds } }));
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const items = [];
    for (const line of parsed.data.items) {
      const product = productMap.get(line.productId);
      if (!product) return NextResponse.json({ error: 'A cart product is unavailable' }, { status: 409 });

      const variant = resolveVariant(product, line.variantId);
      if (variant === null) return NextResponse.json({ error: 'Select a valid variant for each product' }, { status: 400 });
      const availableStock = product.trackInventory && !product.allowBackorders
        ? (variant ? variant.stockQty : product.stockQty ?? 0)
        : null;
      if (availableStock !== null && line.quantity > availableStock) {
        return NextResponse.json({ error: `Only ${availableStock} unit(s) are currently available`, productId: line.productId, variantId: line.variantId }, { status: 409 });
      }

      items.push({
        productId: product._id.toString(),
        ...(variant ? { variantId: variant._id.toString(), variantSku: variant.sku, variantOptions: variant.options } : {}),
        name: product.name,
        price: productPrice(product, variant),
        image: variant?.image || product.image,
        availableStock,
        isAvailable: true,
        quantity: line.quantity,
      });
    }
    
    // Find or create cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      // Update existing cart
      cart.items = items as typeof cart.items;
      await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        user: userId,
        items
      });
    }
    
    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error updating cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear the user's cart
export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const auth = await requireRole(request, ['customer', 'retailer', 'admin']);
    if (!auth.user) return authorizationErrorResponse(auth.error);
    const userId = auth.user.id;

    await connectToDatabase();
    
    // Find cart for user
    let cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      // Clear cart items
      cart.items = [];
      await cart.save();
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing cart:', error.message);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
} 
