import { CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { StatsCard } from '@/components/dashboard/stats-card';

interface PaymentStatsProps {
  totalIncome: number;
  totalExpense: number;
  pendingPayments: number;
  completedPayments: number;
}

export function PaymentStats({
  totalIncome,
  totalExpense,
  pendingPayments,
  completedPayments,
}: PaymentStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        icon={DollarSign}
        iconColor="text-success-700"
        iconBg="bg-success-50"
      />
      <StatsCard
        title="Total Expense"
        value={formatCurrency(totalExpense)}
        icon={CreditCard}
        iconColor="text-error-700"
        iconBg="bg-error-50"
      />
      <StatsCard
        title="Pending"
        value={String(pendingPayments)}
        icon={Clock}
        iconColor="text-warning-700"
        iconBg="bg-warning-50"
      />
      <StatsCard
        title="Completed"
        value={String(completedPayments)}
        icon={CheckCircle}
        iconColor="text-success-700"
        iconBg="bg-success-50"
      />
    </div>
  );
}
