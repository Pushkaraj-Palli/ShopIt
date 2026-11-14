import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import Product from '@/app/models/Product';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';

const reviewSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string().trim().max(500).optional(),
}).strict().superRefine((data, context) => {
  if (data.decision === 'reject' && (!data.reason || data.reason.length < 3)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['reason'], message: 'Provide a reason of at least 3 characters.' });
  }
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid moderation decision', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const reviewedAt = new Date();
    const fields = {
      status: parsed.data.decision === 'approve' ? 'active' : 'rejected',
      reviewedBy: auth.user.id,
      reviewedAt,
      ...(parsed.data.decision === 'reject' ? { rejectionReason: parsed.data.reason } : {}),
    };
    const update = parsed.data.decision === 'approve'
      ? { $set: fields, $unset: { rejectionReason: 1 } }
      : { $set: fields };
    const product = await Product.findOneAndUpdate(
      { _id: params.id, status: 'pending_review' },
      update,
      { new: true, runValidators: true },
    );
    if (!product) return NextResponse.json({ error: 'Pending product not found or already reviewed' }, { status: 404 });

    return NextResponse.json({ success: true, status: product.status });
  } catch (error) {
    console.error('Admin product review failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not review product' }, { status: 500 });
  }
}
