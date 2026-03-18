'use client';

import { use } from 'react';
import { Calendar, FileText, Users } from 'lucide-react';
import { AgreementStatus } from '@openideth/shared';

import { formatCurrency, formatDate } from '@/lib/utils';
import { useAgreement, useSignAgreement } from '@/hooks/use-agreements';
import { useAuthStore } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [AgreementStatus.DRAFT]: 'default',
  [AgreementStatus.PENDING_SIGNATURE]: 'warning',
  [AgreementStatus.ACTIVE]: 'success',
  [AgreementStatus.TERMINATED]: 'error',
  [AgreementStatus.EXPIRED]: 'error',
};

export default function AgreementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { data: agreement, isLoading } = useAgreement(id);
  const signAgreement = useSignAgreement();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!agreement) {
    return <div className="py-12 text-center text-muted">Agreement not found.</div>;
  }

  const canSign =
    (agreement.status === AgreementStatus.DRAFT || agreement.status === AgreementStatus.PENDING_SIGNATURE) &&
    ((user?.id === agreement.landlordId && !agreement.landlordSignedAt) ||
      (user?.id === agreement.tenantId && !agreement.tenantSignedAt));

  const handleSign = () => {
    signAgreement.mutate(id, {
      onSuccess: () => toast({ title: 'Agreement signed', variant: 'success' }),
      onError: () => toast({ title: 'Failed to sign agreement', variant: 'error' }),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agreement Details</h1>
        <Badge variant={statusVariant[agreement.status] || 'default'}>
          {agreement.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Property */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Property</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{agreement.property?.title || 'N/A'}</p>
          <p className="text-sm text-muted">{agreement.property?.address}</p>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Parties</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted">Landlord</p>
            <p className="font-medium">{agreement.landlord?.name}</p>
            <p className="text-sm text-muted">{agreement.landlord?.email}</p>
            {agreement.landlordSignedAt && (
              <Badge variant="success" className="mt-1">Signed {formatDate(agreement.landlordSignedAt)}</Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-muted">Tenant</p>
            <p className="font-medium">{agreement.tenant?.name}</p>
            <p className="text-sm text-muted">{agreement.tenant?.email}</p>
            {agreement.tenantSignedAt && (
              <Badge variant="success" className="mt-1">Signed {formatDate(agreement.tenantSignedAt)}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Terms</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted">Start Date</p>
              <p className="font-medium">{formatDate(agreement.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">End Date</p>
              <p className="font-medium">{formatDate(agreement.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Monthly Rent</p>
              <p className="text-lg font-bold text-primary-700">{formatCurrency(Number(agreement.monthlyRent))}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Deposit</p>
              <p className="font-medium">{formatCurrency(Number(agreement.depositAmount))}</p>
            </div>
          </div>
          {agreement.terms && (
            <div>
              <p className="text-sm text-muted">Additional Terms</p>
              <p className="mt-1 whitespace-pre-line text-sm">{agreement.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {canSign && (
        <div className="flex justify-end">
          <Button onClick={handleSign} loading={signAgreement.isPending}>
            Sign Agreement
          </Button>
        </div>
      )}
    </div>
  );
}
