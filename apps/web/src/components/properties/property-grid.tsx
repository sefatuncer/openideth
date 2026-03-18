'use client';

import { Building2 } from 'lucide-react';

import { type Property } from '@/hooks/use-properties';
import { PropertyCard } from './property-card';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  onFavorite?: (id: string) => void;
  favoriteIds?: Set<string>;
  showStatus?: boolean;
}

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Building2 className="mb-4 h-12 w-12 text-muted" />
      <h3 className="text-lg font-semibold text-foreground">No properties found</h3>
      <p className="mt-1 text-sm text-muted">Try adjusting your search filters.</p>
    </div>
  );
}

export function PropertyGrid({
  properties,
  loading,
  onFavorite,
  favoriteIds,
  showStatus,
}: PropertyGridProps) {
  if (loading) return <PropertyGridSkeleton />;
  if (properties.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onFavorite={onFavorite}
          isFavorite={favoriteIds?.has(property.id)}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}
