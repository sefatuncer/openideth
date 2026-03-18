import {
  type PaginatedResponse,
  type PaymentMethod,
  type PaymentStatus,
} from '@openideth/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface Payment {
  id: string;
  agreementId: string;
  payerId: string;
  payeeId: string;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  platformFee?: string;
  netAmount?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalIncome: number;
  totalExpense: number;
  pendingPayments: number;
  completedPayments: number;
}

export function usePayments(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['payments', page, limit],
    queryFn: () => api.get<PaginatedResponse<Payment>>(`/payments?page=${page}&limit=${limit}`),
  });
}

export function useUpcomingPayments() {
  return useQuery({
    queryKey: ['payments', 'upcoming'],
    queryFn: () => api.get<Payment[]>('/payments/upcoming'),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<Payment>('/payments/stripe/create-intent', data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: () => api.get<PaymentStats>('/payments/stats'),
  });
}
