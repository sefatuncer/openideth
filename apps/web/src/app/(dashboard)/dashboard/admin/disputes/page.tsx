'use client';

import { useState } from 'react';

import { api } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type PaginatedResponse, EscrowStatus } from '@openideth/shared';

interface Dispute {
  id: string;
  agreementId: string;
  amount: string;
  currency: string;
  status: string;
  disputeReason?: string;
  createdAt: string;
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [EscrowStatus.HELD]: 'default',
  [EscrowStatus.RELEASED]: 'success',
  [EscrowStatus.REFUNDED]: 'warning',
  [EscrowStatus.DISPUTED]: 'error',
};

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'disputes', page],
    queryFn: () => api.get<PaginatedResponse<Dispute>>(`/admin/disputes?page=${page}&limit=20`),
  });

  const disputes = data?.data ?? [];
  const meta = data?.meta;

  const handleResolve = async (id: string, action: 'release' | 'refund') => {
    try {
      await api.post(`/escrow/${id}/${action}`);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      toast({ title: `Dispute ${action === 'release' ? 'released' : 'refunded'}`, variant: 'success' });
    } catch {
      toast({ title: 'Failed to resolve dispute', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dispute Resolution</h1>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : disputes.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No disputes found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{formatDate(d.createdAt)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(Number(d.amount), d.currency)}</TableCell>
                <TableCell><Badge variant={statusVariant[d.status] ?? 'default'}>{d.status}</Badge></TableCell>
                <TableCell className="max-w-xs truncate">{d.disputeReason || '–'}</TableCell>
                <TableCell>
                  {d.status === EscrowStatus.DISPUTED && (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => void handleResolve(d.id, 'release')}>Release</Button>
                      <Button variant="destructive" size="sm" onClick={() => void handleResolve(d.id, 'refund')}>Refund</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
