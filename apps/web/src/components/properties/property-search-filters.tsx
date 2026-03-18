'use client';

import { Search } from 'lucide-react';
import { PropertyType } from '@openideth/shared';

import { Input } from '@/components/ui/input';
import { Select, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const propertyTypeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  ...Object.values(PropertyType).map((t) => ({ value: t, label: t.charAt(0) + t.slice(1).toLowerCase() })),
];

const bedroomOptions: SelectOption[] = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

const sortOptions: SelectOption[] = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price', label: 'Price' },
  { value: 'area', label: 'Area' },
];

interface PropertySearchFiltersProps {
  filters: {
    query?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    propertyType?: string;
    sortBy?: string;
  };
  onChange: (filters: PropertySearchFiltersProps['filters']) => void;
  onSearch: () => void;
}

export function PropertySearchFilters({ filters, onChange, onSearch }: PropertySearchFiltersProps) {
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search properties..."
          value={filters.query || ''}
          onChange={(e) => update('query', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="flex h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Input
          placeholder="City"
          value={filters.city || ''}
          onChange={(e) => update('city', e.target.value)}
        />
        <Input
          type="number"
          placeholder="Min price"
          value={filters.minPrice || ''}
          onChange={(e) => update('minPrice', e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice || ''}
          onChange={(e) => update('maxPrice', e.target.value)}
        />
        <Select
          options={bedroomOptions}
          value={filters.bedrooms || ''}
          onChange={(e) => update('bedrooms', e.target.value)}
        />
        <Select
          options={propertyTypeOptions}
          value={filters.propertyType || ''}
          onChange={(e) => update('propertyType', e.target.value)}
        />
        <Select
          options={sortOptions}
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => update('sortBy', e.target.value)}
        />
      </div>

      <Button onClick={onSearch} size="sm" className="w-full sm:w-auto">
        Search
      </Button>
    </div>
  );
}
