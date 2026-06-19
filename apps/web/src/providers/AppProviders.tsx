import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

function Splash() {
  return (
    <div className="grid h-full place-items-center bg-bg">
      <div className="mono animate-pulse text-sm text-ink-3">YourVivac…</div>
    </div>
  );
}

function Bootstrap({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const loadMe = useAuthStore((s) => s.loadMe);
  const clear = useAuthStore((s) => s.clear);
  const { theme, fontPair, density } = useUiStore();

  // Aplica las preferencias visuales al <html> al arrancar.
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-theme', theme);
    el.setAttribute('data-type', fontPair);
    el.setAttribute('data-density', density);
  }, [theme, fontPair, density]);

  // Rehidrata la sesión vía la cookie httpOnly de refresh al cargar.
  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  // Si el interceptor detecta un 401 irrecuperable, vuelve al login.
  useEffect(() => {
    const onUnauthorized = () => {
      clear();
      navigate('/login', { replace: true });
    };
    window.addEventListener('yv:unauthorized', onUnauthorized);
    return () => window.removeEventListener('yv:unauthorized', onUnauthorized);
  }, [clear, navigate]);

  if (status === 'idle' || status === 'loading') return <Splash />;
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Bootstrap>{children}</Bootstrap>
        <Toaster position="top-center" theme="dark" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
