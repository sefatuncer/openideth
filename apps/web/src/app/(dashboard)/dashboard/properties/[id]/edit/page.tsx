'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';

import { useProperty, useUpdateProperty } from '@/hooks/use-properties';
import { PropertyForm, type PropertyFormData } from '@/components/properties/property-form';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: property, isLoading } = useProperty(id);
  const updateProperty = useUpdateProperty();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!property) {
    return <div className="py-12 text-center text-muted">Property not found.</div>;
  }

  const initialData: Partial<PropertyFormData> = {
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    country: property.country,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    area: String(property.area),
    monthlyRent: property.monthlyRent,
    depositAmount: property.depositAmount,
    amenities: property.amenities,
  };

  const handleSubmit = (data: PropertyFormData) => {
    updateProperty.mutate(
      {
        id,
        data: {
          title: data.title,
          description: data.description,
          propertyType: data.propertyType,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          bedrooms: Number(data.bedrooms) || 0,
          bathrooms: Number(data.bathrooms) || 0,
          area: Number(data.area) || 0,
          monthlyRent: Number(data.monthlyRent),
          depositAmount: Number(data.depositAmount),
          amenities: data.amenities,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Property updated', variant: 'success' });
          router.push('/dashboard/properties');
        },
        onError: () => {
          toast({ title: 'Failed to update property', variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Edit Property</h1>
        <p className="text-muted">Update your rental listing details.</p>
      </div>
      <PropertyForm
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={updateProperty.isPending}
        submitLabel="Update Property"
      />
    </div>
  );
}
