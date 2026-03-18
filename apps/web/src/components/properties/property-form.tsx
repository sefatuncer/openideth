'use client';

import { useState } from 'react';
import { PropertyType } from '@openideth/shared';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const propertyTypeOptions: SelectOption[] = Object.values(PropertyType).map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase(),
}));

const amenityOptions = [
  'Parking', 'Pool', 'Gym', 'Elevator', 'Balcony', 'Garden',
  'Air Conditioning', 'Heating', 'Washer', 'Dryer', 'Dishwasher',
  'Furnished', 'Pet Friendly', 'Security', 'Storage',
];

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  monthlyRent: string;
  depositAmount: string;
  amenities: string[];
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}

const defaultData: PropertyFormData = {
  title: '',
  description: '',
  propertyType: PropertyType.APARTMENT,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  monthlyRent: '',
  depositAmount: '',
  amenities: [],
};

export function PropertyForm({ initialData, onSubmit, loading, submitLabel = 'Save Property' }: PropertyFormProps) {
  const [form, setForm] = useState<PropertyFormData>({ ...defaultData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: keyof PropertyFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = form.amenities;
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    update('amenities', next);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Valid rent is required';
    if (!form.depositAmount || Number(form.depositAmount) < 0) errs.depositAmount = 'Valid deposit is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />
        <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} error={errors.description} rows={4} />
        <Select label="Property Type" options={propertyTypeOptions} value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} />
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location</h3>
        <Input label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} error={errors.address} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="City" value={form.city} onChange={(e) => update('city', e.target.value)} error={errors.city} />
          <Input label="State" value={form.state} onChange={(e) => update('state', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Zip Code" value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} />
          <Input label="Country" value={form.country} onChange={(e) => update('country', e.target.value)} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Details</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} />
          <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} />
          <Input label="Area (m²)" type="number" value={form.area} onChange={(e) => update('area', e.target.value)} />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pricing</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Monthly Rent ($)" type="number" value={form.monthlyRent} onChange={(e) => update('monthlyRent', e.target.value)} error={errors.monthlyRent} />
          <Input label="Deposit ($)" type="number" value={form.depositAmount} onChange={(e) => update('depositAmount', e.target.value)} error={errors.depositAmount} />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {amenityOptions.map((amenity) => {
            const selected = form.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-50 text-muted hover:bg-primary-100'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}

export type { PropertyFormData };
