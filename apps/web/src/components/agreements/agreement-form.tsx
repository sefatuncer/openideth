'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface AgreementFormData {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  depositAmount: string;
  terms: string;
}

interface AgreementFormProps {
  initialData?: Partial<AgreementFormData>;
  onSubmit: (data: AgreementFormData) => void;
  loading?: boolean;
}

const defaultData: AgreementFormData = {
  propertyId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  depositAmount: '',
  terms: '',
};

export function AgreementForm({ initialData, onSubmit, loading }: AgreementFormProps) {
  const [form, setForm] = useState<AgreementFormData>({ ...defaultData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof AgreementFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.propertyId) errs.propertyId = 'Property is required';
    if (!form.tenantId) errs.tenantId = 'Tenant is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Valid rent is required';
    if (!form.depositAmount || Number(form.depositAmount) < 0) errs.depositAmount = 'Valid deposit is required';
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agreement Details</h3>
        <Input
          label="Property ID"
          value={form.propertyId}
          onChange={(e) => update('propertyId', e.target.value)}
          error={errors.propertyId}
          helperText="Enter the property ID for this agreement"
        />
        <Input
          label="Tenant ID"
          value={form.tenantId}
          onChange={(e) => update('tenantId', e.target.value)}
          error={errors.tenantId}
          helperText="Enter the tenant's user ID"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dates & Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} error={errors.startDate} />
          <Input label="End Date" type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} error={errors.endDate} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Monthly Rent ($)" type="number" value={form.monthlyRent} onChange={(e) => update('monthlyRent', e.target.value)} error={errors.monthlyRent} />
          <Input label="Deposit ($)" type="number" value={form.depositAmount} onChange={(e) => update('depositAmount', e.target.value)} error={errors.depositAmount} />
        </div>
      </div>

      <Textarea
        label="Terms & Conditions"
        value={form.terms}
        onChange={(e) => update('terms', e.target.value)}
        rows={6}
        helperText="Optional: additional terms for this agreement"
      />

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Create Agreement
      </Button>
    </form>
  );
}

export type { AgreementFormData };
