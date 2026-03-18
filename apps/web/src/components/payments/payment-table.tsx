'use client';

import { PaymentStatus } from '@openideth/shared';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Payment } from '@/hooks/use-payments';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.PROCESSING]: 'default',
  [PaymentStatus.COMPLETED]: 'success',
  [PaymentStatus.FAILED]: 'error',
  [PaymentStatus.REFUNDED]: 'default',
};

interface PaymentTableProps {
  payments: Payment[];
}

export function PaymentTable({ payments }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted">
        No payments found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.paidAt
                ? formatDate(payment.paidAt)
                : <span className="text-muted">–</span>
              }
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(Number(payment.amount), payment.currency)}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[payment.status] || 'default'}>
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell className="capitalize">
              {payment.method.toLowerCase()}
            </TableCell>
            <TableCell>{formatDate(payment.dueDate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
