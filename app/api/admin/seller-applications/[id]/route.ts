import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import connectToDatabase from '@/app/lib/mongodb';
import SellerProfile from '@/app/models/SellerProfile';
import User from '@/app/models/User';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';

const decisionSchema = z.object({
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
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid review decision', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const profile = await SellerProfile.findOne({ _id: params.id, status: 'pending' }).select('userId');
    if (!profile) {
      return NextResponse.json({ error: 'Pending application not found' }, { status: 404 });
    }

    const reviewedAt = new Date();
    if (parsed.data.decision === 'reject') {
      const rejected = await SellerProfile.findOneAndUpdate(
        { _id: params.id, status: 'pending' },
        { $set: { status: 'rejected', rejectionReason: parsed.data.reason, reviewedBy: auth.user.id, reviewedAt } },
        { new: true },
      );
      if (!rejected) return NextResponse.json({ error: 'This application was already reviewed' }, { status: 409 });
      return NextResponse.json({ success: true, status: rejected.status });
    }

    const promotedUser = await User.findOneAndUpdate(
      { _id: profile.userId, role: 'customer', status: 'active' },
      { $set: { role: 'retailer' } },
      { new: true },
    ).select('_id');
    if (!promotedUser) {
      return NextResponse.json({ error: 'Applicant is no longer an active customer' }, { status: 409 });
    }

    const approved = await SellerProfile.findOneAndUpdate(
      { _id: params.id, status: 'pending' },
      {
        $set: { status: 'approved', reviewedBy: auth.user.id, reviewedAt },
        $unset: { rejectionReason: 1 },
      },
      { new: true },
    );

    if (!approved) {
      await User.updateOne({ _id: promotedUser._id, role: 'retailer' }, { $set: { role: 'customer' } });
      return NextResponse.json({ error: 'This application was already reviewed' }, { status: 409 });
    }

    return NextResponse.json({ success: true, status: approved.status });
  } catch (error) {
    console.error('Admin seller application review failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not review seller application' }, { status: 500 });
  }
}
