'use client';

import { useState } from 'react';

import { useFavorites, useToggleFavorite } from '@/hooks/use-properties';
import { PropertyGrid } from '@/components/properties/property-grid';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFavorites(page, 12);
  const toggleFavorite = useToggleFavorite();

  const properties = data?.data ?? [];
  const meta = data?.meta;
  const favoriteIds = new Set(properties.map((p) => p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
        <p className="text-muted">{meta?.total ?? 0} saved properties</p>
      </div>

      <PropertyGrid
        properties={properties}
        loading={isLoading}
        onFavorite={(id) => toggleFavorite.mutate(id)}
        favoriteIds={favoriteIds}
      />

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
