'use client';

import Link from 'next/link';
import { Building2, FileText, CreditCard, Plus } from 'lucide-react';
import { UserRole } from '@openideth/shared';

import { useAuthStore } from '@/hooks/use-auth';
import { usePaymentStats } from '@/hooks/use-payments';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: paymentStats } = usePaymentStats();

  const isLandlord = user?.role === UserRole.LANDLORD;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted">
            Here&apos;s what&apos;s happening with your {isLandlord ? 'properties' : 'rentals'}.
          </p>
        </div>
        {isLandlord && (
          <Link href="/dashboard/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Property
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={isLandlord ? 'Total Income' : 'Total Paid'}
          value={`$${paymentStats?.totalIncome?.toLocaleString() ?? '0'}`}
          icon={CreditCard}
          iconColor="text-success-700"
          iconBg="bg-success-50"
        />
        <StatsCard
          title="Pending Payments"
          value={String(paymentStats?.pendingPayments ?? 0)}
          icon={CreditCard}
          iconColor="text-warning-700"
          iconBg="bg-warning-50"
        />
        <StatsCard
          title="Completed"
          value={String(paymentStats?.completedPayments ?? 0)}
          icon={CreditCard}
          iconColor="text-primary-700"
          iconBg="bg-primary-50"
        />
        <StatsCard
          title={isLandlord ? 'Total Expense' : 'Total Due'}
          value={`$${paymentStats?.totalExpense?.toLocaleString() ?? '0'}`}
          icon={CreditCard}
          iconColor="text-error-700"
          iconBg="bg-error-50"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {isLandlord && (
              <Link href="/dashboard/properties/new">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                  <Building2 className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="font-medium">List Property</p>
                    <p className="text-sm text-muted">Add a new rental listing</p>
                  </div>
                </div>
              </Link>
            )}
            <Link href="/dashboard/agreements">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                <FileText className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="font-medium">Agreements</p>
                  <p className="text-sm text-muted">View your contracts</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/payments">
              <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                <CreditCard className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="font-medium">Payments</p>
                  <p className="text-sm text-muted">{isLandlord ? 'Track earnings' : 'Make a payment'}</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href="/dashboard/admin/users">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                  <p className="font-medium">Manage Users</p>
                </div>
              </Link>
              <Link href="/dashboard/admin/disputes">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                  <p className="font-medium">Resolve Disputes</p>
                </div>
              </Link>
              <Link href="/dashboard/admin">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-primary-50">
                  <p className="font-medium">Admin Dashboard</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
