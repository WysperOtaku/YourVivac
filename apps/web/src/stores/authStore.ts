import { create } from 'zustand';
import type { User } from '@yourvivac/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setAuth: (user: User, accessToken: string) => void;
  clear: () => void;
  loadMe: () => Promise<void>;
}

/** Store de autenticación. Worker (auth web): completa los flujos de login. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  setAuth: (user, accessToken) => {
    api.tokenStore.setAccessToken(accessToken);
    set({ user, status: 'authenticated' });
  },
  clear: () => {
    api.tokenStore.setAccessToken(null);
    set({ user: null, status: 'unauthenticated' });
  },
  loadMe: async () => {
    set({ status: 'loading' });
    try {
      const user = await api.auth.me();
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
