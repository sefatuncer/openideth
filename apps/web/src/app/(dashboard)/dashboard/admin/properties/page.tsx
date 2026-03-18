'use client';

import { useState } from 'react';

import { api } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type PaginatedResponse, PropertyStatus } from '@openideth/shared';

interface AdminProperty {
  id: string;
  title: string;
  city: string;
  monthlyRent: string;
  status: string;
  isVerified: boolean;
  landlord?: { name: string };
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [PropertyStatus.ACTIVE]: 'success',
  [PropertyStatus.DRAFT]: 'default',
  [PropertyStatus.INACTIVE]: 'error',
  [PropertyStatus.RENTED]: 'warning',
};

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'properties', page],
    queryFn: () => api.get<PaginatedResponse<AdminProperty>>(`/properties?page=${page}&limit=20`),
  });

  const properties = data?.data ?? [];
  const meta = data?.meta;

  const handleVerify = async (id: string) => {
    try {
      await api.patch(`/properties/${id}/verify`);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      toast({ title: 'Property verified', variant: 'success' });
    } catch {
      toast({ title: 'Failed to verify', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Property Moderation</h1>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>{p.landlord?.name ?? '–'}</TableCell>
                <TableCell>{p.city}</TableCell>
                <TableCell>{formatCurrency(Number(p.monthlyRent))}</TableCell>
                <TableCell><Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge></TableCell>
                <TableCell>{p.isVerified ? <Badge variant="success">Yes</Badge> : <Badge variant="error">No</Badge>}</TableCell>
                <TableCell>
                  {!p.isVerified && (
                    <Button variant="outline" size="sm" onClick={() => void handleVerify(p.id)}>
                      Verify
                    </Button>
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
