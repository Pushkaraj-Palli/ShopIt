import { NextRequest, NextResponse } from 'next/server';
import SellerProfile from '@/app/models/SellerProfile';
import { authorizationErrorResponse, requireRole } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin']);
  if (!auth.user) return authorizationErrorResponse(auth.error);

  try {
    const profiles = await SellerProfile.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'name email');

    const applications = profiles.map((profile) => {
      const applicant = profile.userId as unknown as { _id: { toString(): string }; name: string; email: string };
      return {
        id: profile._id.toString(),
        storeName: profile.storeName,
        contactEmail: profile.contactEmail,
        contactPhone: profile.contactPhone,
        businessAddress: profile.businessAddress,
        taxId: profile.taxId ?? '',
        createdAt: profile.createdAt,
        applicant: {
          id: applicant._id.toString(),
          name: applicant.name,
          email: applicant.email,
        },
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Admin seller application list failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Could not load seller applications' }, { status: 500 });
  }
}
