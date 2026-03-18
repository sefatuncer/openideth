import { type AgreementStatus, type PaginatedResponse } from '@openideth/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface Agreement {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  depositAmount: string;
  terms?: string;
  status: AgreementStatus;
  landlordSignedAt?: string;
  tenantSignedAt?: string;
  documentUrl?: string;
  documentHash?: string;
  createdAt: string;
  updatedAt: string;
  property?: { id: string; title: string; address: string };
  landlord?: { id: string; name: string; email: string };
  tenant?: { id: string; name: string; email: string };
}

export function useAgreements(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['agreements', page, limit],
    queryFn: () =>
      api.get<PaginatedResponse<Agreement>>(`/agreements?page=${page}&limit=${limit}`),
  });
}

export function useAgreement(id: string) {
  return useQuery({
    queryKey: ['agreements', id],
    queryFn: () => api.get<Agreement>(`/agreements/${id}`),
    enabled: !!id,
  });
}

export function useCreateAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Agreement>('/agreements', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agreements'] });
    },
  });
}

export function useSignAgreement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Agreement>(`/agreements/${id}/sign`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agreements'] });
    },
  });
}
