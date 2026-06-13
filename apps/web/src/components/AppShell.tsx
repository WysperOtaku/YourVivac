import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Home, Map, Package, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from '@/ui';

const tabs = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/explorar', label: 'Explorar', icon: Compass, end: false },
  { to: '/equipo', label: 'Equipo', icon: Package, end: false },
  { to: '/consejos', label: 'Consejos', icon: Map, end: false },
  { to: '/perfil', label: 'Perfil', icon: User, end: false },
];

/** Layout base con cabecera y barra de pestañas inferior (paridad con el diseño móvil). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-[18px] py-3">
        <Logo />
      </header>
      <main className="flex-1 px-[18px] pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-2xl justify-around bg-bg-2 px-2 py-2 shadow-[inset_0_1px_0_var(--line)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-1 text-ink-3',
                isActive && 'text-accent',
              )
            }
          >
            <Icon size={22} />
            <span className="font-mono text-[9.5px] tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
