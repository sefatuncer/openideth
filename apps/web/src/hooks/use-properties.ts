import {
  type PaginatedResponse,
  type PropertySearchInput,
  type PropertyStatus,
  type PropertyType,
} from '@openideth/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  monthlyRent: string;
  depositAmount: string;
  amenities: string[];
  status: PropertyStatus;
  isVerified: boolean;
  availableFrom: string;
  createdAt: string;
  updatedAt: string;
  images?: { id: string; url: string; caption?: string; isPrimary: boolean; order: number }[];
  landlord?: { id: string; name: string; avatarUrl?: string };
  _count?: { reviews: number };
  averageRating?: number;
}

function buildSearchParams(search: PropertySearchInput): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export function useProperties(search: PropertySearchInput = {}) {
  return useQuery({
    queryKey: ['properties', search],
    queryFn: () => {
      const qs = buildSearchParams(search);
      return api.get<PaginatedResponse<Property>>(`/properties${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => api.get<Property>(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useMyListings(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['my-listings', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Property>>(`/properties/my-listings?page=${page}&limit=${limit}`),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Property>('/properties', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch<Property>(`/properties/${id}`, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      void queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useFavorites(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['favorites', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Property>>(`/properties/favorites?page=${page}&limit=${limit}`),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => api.post(`/properties/${propertyId}/favorite`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
