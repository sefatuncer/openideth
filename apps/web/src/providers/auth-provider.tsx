'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthStore } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';

const PUBLIC_PATHS = ['/', '/login', '/register', '/properties'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/properties/')) return true;
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshUser, isLoading, isAuthenticated } = useAuthStore();
  useSocket(); // Connect WebSocket for real-time notifications
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicPath(pathname)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
