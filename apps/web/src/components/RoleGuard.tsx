import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@yourvivac/types';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  roles?: UserRole[];
  children: ReactNode;
}

/** Guard de ruta por rol. Requiere sesión y, si se indica, un rol permitido. */
export function RoleGuard({ roles, children }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <div className="p-8 text-ink-2">Sin permiso para ver esta sección.</div>;
  }
  return <>{children}</>;
}
