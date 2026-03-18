'use client';

import { useRouter } from 'next/navigation';

import { useCreateProperty } from '@/hooks/use-properties';
import { PropertyForm, type PropertyFormData } from '@/components/properties/property-form';
import { toast } from '@/hooks/use-toast';

export default function NewPropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();

  const handleSubmit = (data: PropertyFormData) => {
    createProperty.mutate(
      {
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
      {
        onSuccess: () => {
          toast({ title: 'Property created', variant: 'success' });
          router.push('/dashboard/properties');
        },
        onError: () => {
          toast({ title: 'Failed to create property', variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">List a New Property</h1>
        <p className="text-muted">Fill in the details to create your rental listing.</p>
      </div>

      <PropertyForm
        onSubmit={handleSubmit}
        loading={createProperty.isPending}
        submitLabel="Create Property"
      />
    </div>
  );
}
