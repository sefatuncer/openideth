'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bath, BedDouble, MapPin, Maximize, Star, User } from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { useProperty } from '@/hooks/use-properties';
import { PropertyImageGallery } from '@/components/properties/property-image-gallery';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: property, isLoading } = useProperty(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Property not found</h2>
        <Link href="/properties" className="mt-4 text-primary-600 hover:underline">
          Back to properties
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/properties"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to properties
      </Link>

      {/* Image Gallery */}
      {property.images && property.images.length > 0 && (
        <PropertyImageGallery images={property.images} />
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title and price */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{property.title}</h1>
              <Badge variant="success">{property.status}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-1 text-muted">
              <MapPin className="h-4 w-4" />
              <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-primary-700">
              {formatCurrency(Number(property.monthlyRent))}
              <span className="text-base font-normal text-muted">/month</span>
            </p>
          </div>

          {/* Details */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Property Details</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm text-muted">Area</p>
                    <p className="font-semibold">{property.area} m²</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-3 text-lg font-semibold">Description</h2>
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">{property.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-3 text-lg font-semibold">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <Badge key={a} variant="default">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {property.averageRating !== undefined && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-warning-500 text-warning-500" />
                  <span className="text-lg font-semibold">{property.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted">
                    ({property._count?.reviews ?? 0} review{(property._count?.reviews ?? 0) !== 1 ? 's' : ''})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord */}
          {property.landlord && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-sm font-semibold text-muted">Listed by</h3>
                <div className="flex items-center gap-3">
                  <Avatar fallback={property.landlord.name} src={property.landlord.avatarUrl} />
                  <div>
                    <p className="font-medium text-foreground">{property.landlord.name}</p>
                    <p className="text-xs text-muted">Property Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-700">
                  {formatCurrency(Number(property.monthlyRent))}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
                <p className="text-sm text-muted">
                  Deposit: {formatCurrency(Number(property.depositAmount))}
                </p>
              </div>
              <Link href="/register">
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Apply Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
