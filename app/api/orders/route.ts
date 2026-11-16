import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Order from '@/app/models/Order';
import { verifyAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        items: order.items.map((item: any) => ({
          productId: item.productId?.toString(),
          title: item.title,
          image: item.image,
          unitPrice: item.unitPrice,
          qty: item.qty,
          status: item.status,
          trackingNumber: item.trackingNumber,
        })),
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, subtotal, total, discount = 0, shippingFee = 0, tax = 0 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    await connectToDatabase();

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      userId,
      items: items.map((item) => ({
        productId: item.id || item.productId,
        variantId: item.variantId,
        sellerId: item.sellerId,
        title: item.name || item.title,
        image: item.image,
        unitPrice: item.price || item.unitPrice,
        qty: item.quantity || item.qty || 1,
        status: 'pending',
      })),
      shippingAddress,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      currency: 'INR',
      paymentStatus: 'paid', // test mode
      orderStatus: 'pending',
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.orderStatus,
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
