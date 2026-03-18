'use client';

import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
