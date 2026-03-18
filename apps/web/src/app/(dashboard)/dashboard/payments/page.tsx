'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@openideth/shared';

import { usePayments, usePaymentStats } from '@/hooks/use-payments';
import { useAuthStore } from '@/hooks/use-auth';
import { PaymentTable } from '@/components/payments/payment-table';
import { PaymentStats } from '@/components/payments/payment-stats';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePayments(page, 20);
  const { data: stats } = usePaymentStats();

  const payments = data?.data ?? [];
  const meta = data?.meta;
  const isTenant = user?.role === UserRole.TENANT;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        {isTenant && (
          <Link href="/dashboard/payments/pay">
            <Button>Make Payment</Button>
          </Link>
        )}
      </div>

      {stats ? (
        <PaymentStats
          totalIncome={stats.totalIncome}
          totalExpense={stats.totalExpense}
          pendingPayments={stats.pendingPayments}
          completedPayments={stats.completedPayments}
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <PaymentTable payments={payments} />
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted">Page {page} of {meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
