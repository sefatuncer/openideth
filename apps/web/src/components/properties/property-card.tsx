'use client';

import Link from 'next/link';
import { Bath, BedDouble, Heart, MapPin, Maximize } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { type Property } from '@/hooks/use-properties';
import { PropertyStatus } from '@openideth/shared';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  [PropertyStatus.ACTIVE]: 'success',
  [PropertyStatus.DRAFT]: 'default',
  [PropertyStatus.INACTIVE]: 'error',
  [PropertyStatus.RENTED]: 'warning',
};

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  onFavorite,
  isFavorite,
  showStatus,
  className,
}: PropertyCardProps) {
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];

  return (
    <div className={cn('group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md', className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Maximize className="h-10 w-10" />
          </div>
        )}

        {/* Status badge */}
        {showStatus && (
          <div className="absolute left-3 top-3">
            <Badge variant={statusVariant[property.status] || 'default'}>
              {property.status}
            </Badge>
          </div>
        )}

        {/* Favorite button */}
        {onFavorite && (
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              onFavorite(property.id);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn('h-5 w-5', isFavorite ? 'fill-error-500 text-error-500' : 'text-muted')}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <Link href={`/properties/${property.id}`} className="block p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-base font-semibold text-foreground line-clamp-1">
            {property.title}
          </h3>
          <span className="ml-2 whitespace-nowrap text-lg font-bold text-primary-700">
            {formatCurrency(Number(property.monthlyRent))}
            <span className="text-xs font-normal text-muted">/mo</span>
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{property.city}, {property.state}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {property.bathrooms} bath
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            {property.area} m²
          </span>
        </div>
      </Link>
    </div>
  );
}
