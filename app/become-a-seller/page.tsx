"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';

const applicationSchema = z.object({
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters').max(80),
  contactEmail: z.string().trim().email('Enter a valid contact email').max(254),
  contactPhone: z.string().trim().min(7, 'Enter a valid contact phone').max(30),
  businessAddress: z.string().trim().min(8, 'Enter your business address').max(400),
  taxId: z.string().trim().max(40).optional(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;
type ApplicationSummary = {
  storeName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
};

export default function BecomeASellerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, token, user } = useAuth();
  const [application, setApplication] = useState<ApplicationSummary | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { storeName: '', contactEmail: '', contactPhone: '', businessAddress: '', taxId: '' },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/account/login?next=/become-a-seller');
      return;
    }
    if (user?.role && user.role !== 'customer') {
      router.replace('/seller');
      return;
    }

    const loadApplication = async () => {
      try {
        const response = await fetch('/api/seller/applications', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load your application');
        setApplication(data.application);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load your application');
      } finally {
        setLoadingApplication(false);
      }
    };

    void loadApplication();
  }, [authLoading, isAuthenticated, router, token, user?.role]);

  const submitApplication = async (values: ApplicationValues) => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/seller/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit your application');
      setApplication(data.application);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not submit your application');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingApplication) {
    return <main className="container mx-auto max-w-2xl px-4 py-16" aria-busy="true">Loading seller application…</main>;
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-primary">ShopIt Seller Program</p>
        <h1 className="text-3xl font-bold">Apply to sell on ShopIt</h1>
        <p className="text-muted-foreground">Send your store and business contact details. An admin will review your application.</p>
      </div>

      {application && application.status !== 'rejected' ? (
        <section className="rounded-lg border p-6" aria-live="polite" data-testid="seller-application-status-card">
          <h2 className="text-xl font-semibold">{application.storeName}</h2>
          <p className="mt-2 text-muted-foreground">
            Application status: <span data-testid="seller-application-status" className="font-medium capitalize text-foreground">{application.status}</span>
          </p>
          {application.status === 'pending' && <p className="mt-3 text-sm text-muted-foreground">We’ll update your account after the review.</p>}
        </section>
      ) : (
        <form data-testid="seller-application-form" onSubmit={handleSubmit(submitApplication)} className="space-y-5 rounded-lg border p-6">
          {application?.rejectionReason && (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Previous application feedback: {application.rejectionReason}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="storeName">Store name</Label>
            <Input id="storeName" data-testid="seller-store-name" autoComplete="organization" {...register('storeName')} disabled={submitting} />
            {errors.storeName && <p className="text-sm text-destructive">{errors.storeName.message}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Business contact email</Label>
              <Input id="contactEmail" data-testid="seller-contact-email" type="email" autoComplete="email" {...register('contactEmail')} disabled={submitting} />
              {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Business contact phone</Label>
              <Input id="contactPhone" data-testid="seller-contact-phone" type="tel" autoComplete="tel" {...register('contactPhone')} disabled={submitting} />
              {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business address</Label>
            <Textarea id="businessAddress" data-testid="seller-business-address" autoComplete="street-address" {...register('businessAddress')} disabled={submitting} />
            {errors.businessAddress && <p className="text-sm text-destructive">{errors.businessAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / GST ID <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="taxId" data-testid="seller-tax-id" {...register('taxId')} disabled={submitting} />
            {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
          </div>
          <p className="text-sm text-muted-foreground">Payout details are collected after approval. Don’t enter bank or card details here.</p>
          {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
          <Button type="submit" data-testid="seller-application-submit" disabled={submitting}>
            {submitting ? 'Submitting…' : application ? 'Resubmit application' : 'Submit application'}
          </Button>
        </form>
      )}
    </main>
  );
}
