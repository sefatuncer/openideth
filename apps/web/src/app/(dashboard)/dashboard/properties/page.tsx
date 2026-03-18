'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { useMyListings } from '@/hooks/use-properties';
import { PropertyGrid } from '@/components/properties/property-grid';
import { Button } from '@/components/ui/button';

export default function MyPropertiesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyListings(page, 12);

  const properties = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-muted">Manage your rental listings</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Property
          </Button>
        </Link>
      </div>

      {meta && (
        <p className="text-sm text-muted">
          {meta.total} propert{meta.total === 1 ? 'y' : 'ies'}
        </p>
      )}

      <PropertyGrid
        properties={properties}
        loading={isLoading}
        showStatus
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
