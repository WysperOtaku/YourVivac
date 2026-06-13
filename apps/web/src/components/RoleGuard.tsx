import type { ReactNode } from 'react';
import type { UserRole } from '@yourvivac/types';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  roles?: UserRole[];
  children: ReactNode;
}

/**
 * Guard de ruta por rol. Stub permisivo mientras auth no esté implementado:
 * Worker (auth web): activa la redirección a /login y el chequeo real de rol.
 */
export function RoleGuard({ roles, children }: Props) {
  const user = useAuthStore((s) => s.user);
  // TODO(worker auth): if (!user) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <div className="p-8 text-ink-2">Sin permiso para ver esta sección.</div>;
  }
  return <>{children}</>;
}
