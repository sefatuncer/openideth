import { type UserRole } from '@openideth/shared';

interface JwtPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  return payload.exp * 1000 > Date.now();
}

export function getUserFromToken(): JwtPayload | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return decodeToken(token);
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}
