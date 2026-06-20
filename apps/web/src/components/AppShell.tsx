import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Icon, Logo, type IconName } from '@/ui';
import { cn } from '@/lib/cn';
import { NotificationsBell } from '@/components/NotificationsBell';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/explorar', label: 'Explorar', icon: 'compass' },
  { to: '/salidas', label: 'Salidas', icon: 'layers' },
  { to: '/equipo', label: 'Mi equipo', icon: 'list' },
  { to: '/consejos', label: 'Consejos', icon: 'note' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
];

// Pestañas inferiores (móvil): 5 con el botón central de "nueva salida".
const TABS: (NavItem & { center?: boolean })[] = [
  { to: '/', label: 'Inicio', icon: 'home', end: true },
  { to: '/explorar', label: 'Explorar', icon: 'compass' },
  { to: '/crear', label: '', icon: 'plus', center: true },
  { to: '/salidas', label: 'Salidas', icon: 'layers' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
];

interface Props {
  children: ReactNode;
  /** Cabecera de escritorio (título + subtítulo + acciones). */
  topbar?: { title: string; sub?: string; actions?: ReactNode };
  /** Oculta la topbar de escritorio (pantallas que traen su propia cabecera). */
  bareDesktop?: boolean;
  /** En móvil, oculta la tab bar inferior (subpáginas a pantalla completa). */
  mobileFullscreen?: boolean;
}

/** Layout responsive: rail + topbar en escritorio (lg+), tab bar inferior en móvil. */
export function AppShell({ children, topbar, bareDesktop, mobileFullscreen }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    if (q) navigate(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex h-full bg-bg">
      {/* Rail izquierdo (escritorio) */}
      <aside className="hidden w-60 flex-none flex-col bg-bg-2 px-[18px] py-7 shadow-[inset_-1px_0_0_var(--line)] lg:flex">
        <div className="px-2 pb-5">
          <Logo size={21} />
        </div>
        <button className="btn btn--block mb-5" onClick={() => navigate('/crear')}>
          <Icon name="plus" size={18} /> Nueva salida
        </button>
        <nav className="stack gap2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'row gap12 rounded-[11px] px-3 py-2.5 text-[15px] text-ink-2',
                  isActive && 'bg-bg-4 text-ink shadow-[inset_0_0_0_1px_var(--line)]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={18} className={isActive ? 'text-accent' : ''} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="grow" />
        <NavLink
          to="/ajustes"
          className="row gap10 rounded-control px-2 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]"
        >
          <Avatar name={user?.displayName ?? 'Invitado'} size={34} />
          <div className="grow min-w-0">
            <div className="truncate text-sm">{user?.displayName ?? 'Invitado'}</div>
            <div className="faint mono text-[10.5px]">{user ? `${user.stats?.trips ?? 0} salidas` : 'sin sesión'}</div>
          </div>
          <Icon name="settings" size={18} className="text-ink-3" />
        </NavLink>
      </aside>

      {/* Columna principal */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {topbar && !bareDesktop && (
          <header className="hidden flex-none items-center justify-between px-7 py-5 shadow-[inset_0_-1px_0_var(--line)] lg:flex">
            <div>
              {topbar.sub && <div className="eyebrow">{topbar.sub}</div>}
              <h2 className="mt-1 text-[25px]">{topbar.title}</h2>
            </div>
            <div className="row gap14">
              <form onSubmit={submitSearch} className="row gap10 w-64 rounded-[11px] bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
                <Icon name="search" size={18} className="text-ink-3" />
                <input
                  name="q"
                  className="grow bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
                  placeholder="Buscar usuarios, salidas, consejos…"
                />
              </form>
              <NotificationsBell />
              <button onClick={() => navigate('/perfil')} aria-label="Tu perfil">
                <Avatar name={user?.displayName ?? 'Invitado'} size={36} src={user?.avatar?.url} me className="overflow-hidden" />
              </button>
              {topbar.actions}
            </div>
          </header>
        )}

        {/* Contenido scrollable */}
        <div className={cn('flex-1 overflow-y-auto lg:pb-0', mobileFullscreen ? 'pb-0' : 'pb-24')}>{children}</div>

        {/* Tab bar inferior (móvil) */}
        <nav className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex items-center justify-around bg-bg-2 px-2 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_var(--line)] lg:hidden',
          mobileFullscreen && 'hidden',
        )}>
          {TABS.map((t) =>
            t.center ? (
              <NavLink key={t.to} to={t.to} className="flex-none">
                <span className="-mt-2 grid h-[46px] w-[46px] place-items-center rounded-[16px] bg-accent text-accent-ink shadow">
                  <Icon name="plus" size={26} />
                </span>
              </NavLink>
            ) : (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn('flex flex-1 flex-col items-center gap-1 py-1 text-ink-3', isActive && 'text-accent')
                }
              >
                <Icon name={t.icon} size={22} />
                <span className="font-mono text-[9.5px] tracking-wide">{t.label}</span>
              </NavLink>
            ),
          )}
        </nav>
      </main>
    </div>
  );
}
