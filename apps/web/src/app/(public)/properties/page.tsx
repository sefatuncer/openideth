'use client';

import { useState } from 'react';

import { useProperties } from '@/hooks/use-properties';
import { PropertyGrid } from '@/components/properties/property-grid';
import { PropertySearchFilters } from '@/components/properties/property-search-filters';
import { Button } from '@/components/ui/button';

export default function PropertiesPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProperties({
    ...searchParams,
    page,
    limit: 12,
  });

  const properties = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = () => {
    setSearchParams({ ...filters });
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Find Your Next Home</h1>
        <p className="mt-2 text-muted">Browse available rental properties</p>
      </div>

      <PropertySearchFilters
        filters={filters}
        onChange={setFilters}
        onSearch={handleSearch}
      />

      {meta && (
        <p className="mt-6 text-sm text-muted">
          {meta.total} propert{meta.total === 1 ? 'y' : 'ies'} found
        </p>
      )}

      <div className="mt-4">
        <PropertyGrid
          properties={properties}
          loading={isLoading}
        />
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
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
