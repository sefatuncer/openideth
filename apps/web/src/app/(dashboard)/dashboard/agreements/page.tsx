'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { UserRole } from '@openideth/shared';

import { useAgreements } from '@/hooks/use-agreements';
import { useAuthStore } from '@/hooks/use-auth';
import { AgreementCard } from '@/components/agreements/agreement-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgreementsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAgreements(page, 20);

  const agreements = data?.data ?? [];
  const meta = data?.meta;
  const isLandlord = user?.role === UserRole.LANDLORD;

  const filterByStatus = (status: string) =>
    status === 'all' ? agreements : agreements.filter((a) => a.status === status);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agreements</h1>
          <p className="text-muted">
            {meta?.total ?? 0} agreement{(meta?.total ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {isLandlord && (
          <Link href="/dashboard/agreements/new">
            <Button><Plus className="mr-2 h-4 w-4" />New Agreement</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="PENDING_SIGNATURE">Pending</TabsTrigger>
          <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
        </TabsList>

        {['all', 'ACTIVE', 'DRAFT', 'PENDING_SIGNATURE', 'EXPIRED'].map((status) => (
          <TabsContent key={status} value={status}>
            {filterByStatus(status).length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">No agreements found.</p>
            ) : (
              <div className="space-y-3">
                {filterByStatus(status).map((agreement) => (
                  <AgreementCard key={agreement.id} agreement={agreement} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

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
