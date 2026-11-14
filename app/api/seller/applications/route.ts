import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import SellerProfile from '@/app/models/SellerProfile';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';

const applicationSchema = z.object({
  storeName: z.string().trim().min(2).max(80),
  contactEmail: z.string().trim().email().max(254),
  contactPhone: z.string().trim().min(7).max(30),
  businessAddress: z.string().trim().min(8).max(400),
  taxId: z.string().trim().max(40).optional().default(''),
}).strict();

function createStoreSlug(storeName: string, userId: string) {
  const base = storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'store';
  return `${base}-${userId.slice(-8)}`;
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['customer']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

  try {
    const application = await SellerProfile.findOne({ userId: auth.user.id })
      .select('storeName status rejectionReason createdAt updatedAt')
      .lean();
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Seller application lookup failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load seller application' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['customer']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the application details', details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const existing = await SellerProfile.findOne({ userId: auth.user.id });
    if (existing && existing.status !== 'rejected') {
      return NextResponse.json(
        { error: 'An application already exists', status: existing.status },
        { status: 409 },
      );
    }

    const application = existing ?? new SellerProfile({ userId: auth.user.id });
    application.storeName = parsed.data.storeName;
    application.slug = createStoreSlug(parsed.data.storeName, auth.user.id);
    application.contactEmail = parsed.data.contactEmail;
    application.contactPhone = parsed.data.contactPhone;
    application.businessAddress = parsed.data.businessAddress;
    application.taxId = parsed.data.taxId || undefined;
    application.status = 'pending';
    application.rejectionReason = undefined;
    application.reviewedBy = undefined;
    application.reviewedAt = undefined;
    await application.save();

    return NextResponse.json(
      { application: { storeName: application.storeName, status: application.status } },
      { status: existing ? 200 : 201 },
    );
  } catch (error) {
    console.error('Seller application submission failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not submit seller application' }, { status: 500 });
  }
}
