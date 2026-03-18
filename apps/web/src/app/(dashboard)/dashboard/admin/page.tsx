'use client';

import { Building2, CreditCard, FileText, Users } from 'lucide-react';

import { api } from '@/lib/api-client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalAgreements: number;
  totalPayments: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={String(stats?.totalUsers ?? 0)} icon={Users} iconColor="text-primary-700" iconBg="bg-primary-50" />
        <StatsCard title="Properties" value={String(stats?.totalProperties ?? 0)} icon={Building2} iconColor="text-success-700" iconBg="bg-success-50" />
        <StatsCard title="Agreements" value={String(stats?.totalAgreements ?? 0)} icon={FileText} iconColor="text-warning-700" iconBg="bg-warning-50" />
        <StatsCard title="Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={CreditCard} iconColor="text-success-700" iconBg="bg-success-50" />
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: '/dashboard/admin/users', label: 'Users' },
            { href: '/dashboard/admin/properties', label: 'Properties' },
            { href: '/dashboard/admin/payments', label: 'Payments' },
            { href: '/dashboard/admin/disputes', label: 'Disputes' },
          ].map((link) => (
            <a key={link.href} href={link.href} className="rounded-lg border border-border p-4 text-center font-medium transition-colors hover:bg-primary-50">
              {link.label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
