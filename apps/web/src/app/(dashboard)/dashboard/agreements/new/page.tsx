'use client';

import { useRouter } from 'next/navigation';

import { useCreateAgreement } from '@/hooks/use-agreements';
import { AgreementForm, type AgreementFormData } from '@/components/agreements/agreement-form';
import { toast } from '@/hooks/use-toast';

export default function NewAgreementPage() {
  const router = useRouter();
  const createAgreement = useCreateAgreement();

  const handleSubmit = (data: AgreementFormData) => {
    createAgreement.mutate(
      {
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        monthlyRent: Number(data.monthlyRent),
        depositAmount: Number(data.depositAmount),
        terms: data.terms || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Agreement created', variant: 'success' });
          router.push('/dashboard/agreements');
        },
        onError: () => {
          toast({ title: 'Failed to create agreement', variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Agreement</h1>
        <p className="text-muted">Set up a new rental agreement.</p>
      </div>
      <AgreementForm onSubmit={handleSubmit} loading={createAgreement.isPending} />
    </div>
  );
}
