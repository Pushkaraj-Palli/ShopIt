"use client";

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';

type SellerApplication = {
  id: string;
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  taxId: string;
  createdAt: string;
  applicant: { id: string; name: string; email: string };
};

export default function AdminRetailersPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/seller-applications', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load applications');
      setApplications(data.applications);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load applications');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  const reviewApplication = async (applicationId: string, decision: 'approve' | 'reject') => {
    const reason = reasons[applicationId]?.trim();
    if (decision === 'reject' && (!reason || reason.length < 3)) {
      setErrorMessage('Add a rejection reason of at least 3 characters.');
      return;
    }

    setActingOn(applicationId);
    setErrorMessage('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ decision, ...(decision === 'reject' ? { reason } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not review application');
      setApplications((current) => current.filter((application) => application.id !== applicationId));
      setNotice(decision === 'approve' ? 'Seller approved. Their role is now retailer.' : 'Application rejected. The applicant can review your reason and apply again.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not review application');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Admin</p>
          <h1 className="text-3xl font-bold">Seller applications</h1>
          <p className="mt-2 text-muted-foreground">Review business details and decide who can sell on ShopIt.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadApplications()} disabled={loading} data-testid="refresh-seller-applications">
          Refresh queue
        </Button>
      </div>

      {errorMessage && <p role="alert" className="mb-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</p>}
      {notice && <p role="status" className="mb-5 rounded-md bg-primary/10 p-3 text-sm" data-testid="seller-review-notice">{notice}</p>}

      {loading ? (
        <p data-testid="loading" aria-busy="true" className="text-muted-foreground">Loading applications…</p>
      ) : applications.length === 0 ? (
        <p className="rounded-lg border p-8 text-center text-muted-foreground" data-testid="seller-applications-empty">There are no pending seller applications.</p>
      ) : (
        <div className="space-y-5" data-testid="seller-applications-list">
          {applications.map((application) => (
            <article key={application.id} className="rounded-lg border p-6" data-testid="seller-application-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{application.storeName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Applied by {application.applicant.name} ({application.applicant.email})</p>
                  <p className="text-sm text-muted-foreground">Submitted {new Date(application.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300">Pending</span>
              </div>

              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="font-medium">Contact email</dt><dd className="mt-1 text-muted-foreground">{application.contactEmail}</dd></div>
                <div><dt className="font-medium">Contact phone</dt><dd className="mt-1 text-muted-foreground">{application.contactPhone}</dd></div>
                <div><dt className="font-medium">Business address</dt><dd className="mt-1 text-muted-foreground">{application.businessAddress}</dd></div>
                <div><dt className="font-medium">Tax / GST ID</dt><dd className="mt-1 text-muted-foreground">{application.taxId || 'Not provided'}</dd></div>
              </dl>

              <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full space-y-2 sm:max-w-md">
                  <Label htmlFor={`reject-reason-${application.id}`}>Rejection reason</Label>
                  <Textarea
                    id={`reject-reason-${application.id}`}
                    data-testid="seller-rejection-reason"
                    value={reasons[application.id] ?? ''}
                    onChange={(event) => setReasons((current) => ({ ...current, [application.id]: event.target.value }))}
                    maxLength={500}
                    placeholder="Tell the applicant what needs to change"
                    disabled={actingOn === application.id}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" data-testid="reject-seller-application" onClick={() => void reviewApplication(application.id, 'reject')} disabled={actingOn === application.id}>
                    Reject
                  </Button>
                  <Button type="button" data-testid="approve-seller-application" onClick={() => void reviewApplication(application.id, 'approve')} disabled={actingOn === application.id}>
                    {actingOn === application.id ? 'Saving…' : 'Approve seller'}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
