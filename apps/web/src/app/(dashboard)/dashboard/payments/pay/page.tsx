'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethod } from '@openideth/shared';

import { useCreatePayment } from '@/hooks/use-payments';
import { Input } from '@/components/ui/input';
import { Select, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const methodOptions: SelectOption[] = [
  { value: PaymentMethod.STRIPE, label: 'Credit/Debit Card (Stripe)' },
  { value: PaymentMethod.ETH, label: 'Ethereum (ETH)' },
  { value: PaymentMethod.USDT, label: 'USDT' },
];

export default function MakePaymentPage() {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const [agreementId, setAgreementId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PaymentMethod.STRIPE);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreementId || !amount || Number(amount) <= 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }

    createPayment.mutate(
      { agreementId, amount: Number(amount), method },
      {
        onSuccess: () => {
          toast({ title: 'Payment initiated', variant: 'success' });
          router.push('/dashboard/payments');
        },
        onError: () => {
          toast({ title: 'Payment failed', variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Make a Payment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-error-50 p-3 text-sm text-error-700">{error}</div>
            )}
            <Input
              label="Agreement ID"
              value={agreementId}
              onChange={(e) => setAgreementId(e.target.value)}
              placeholder="Enter your agreement ID"
              required
            />
            <Input
              label="Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
              step="0.01"
            />
            <Select
              label="Payment Method"
              options={methodOptions}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            />
            <Button type="submit" loading={createPayment.isPending} className="w-full">
              Pay Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
