import { type UserRole } from '@openideth/shared';
import { create } from 'zustand';

import { api, clearTokens, setTokens } from '@/lib/api-client';
import { getUserFromToken } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  walletAddress?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (email, password, name, role) => {
    const data = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      role,
    });
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors during logout
    } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshUser: async () => {
    const tokenPayload = getUserFromToken();
    if (!tokenPayload) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await api.get<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
}));
