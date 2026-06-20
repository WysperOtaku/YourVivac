import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UpdateSettingsRequest } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon, Toggle, type IconName } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { GuideApplyModal } from './GuideApplyModal';
import { EditProfileModal } from './EditProfileModal';
import { PrivacyModal } from './PrivacyModal';

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-[18px]">
      <div className="eyebrow mb-2">{label}</div>
      <div className="card px-3.5 py-0.5">{children}</div>
    </section>
  );
}

function Row({
  icon,
  t,
  sub,
  right,
  last,
  tone,
}: {
  icon: IconName;
  t: string;
  sub?: string;
  right?: React.ReactNode;
  last?: boolean;
  tone?: string;
}) {
  return (
    <div className={`row gap12 py-3 ${last ? '' : 'border-b border-[var(--line)]'}`}>
      <div
        className="grid h-[34px] w-[34px] place-items-center rounded-control shadow-[inset_0_0_0_1px_var(--line)]"
        style={{ color: tone ?? 'var(--ink-2)' }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="grow min-w-0">
        <div className="text-[15px]">{t}</div>
        {sub && <div className="faint mono mt-0.5 text-[11px]">{sub}</div>}
      </div>
      {right ?? <Icon name="chevron" size={18} className="text-ink-3" />}
    </div>
  );
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUiStore();
  const { user, clear, setUser } = useAuthStore();
  const [guideOpen, setGuideOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const settings = user?.settings;

  const settingsMut = useMutation({
    mutationFn: (patch: UpdateSettingsRequest) => api.users.updateSettings(patch),
    onSuccess: (updated) => setUser(updated),
    onError: (e) => toast.error(errMsg(e, 'No se pudieron guardar los ajustes')),
  });

  async function logout() {
    try {
      await api.auth.logout();
    } catch {
      /* da igual si falla: limpiamos la sesión local de todos modos */
    }
    clear();
    navigate('/login', { replace: true });
  }

  return (
    <AppShell topbar={{ title: 'Ajustes', sub: 'Cuenta' }} mobileFullscreen>
      {/* Cabecera móvil */}
      <header className="row gap10 flex-none px-[18px] pb-1 pt-2 lg:hidden">
        <button onClick={() => navigate(-1)} aria-label="Volver"><Icon name="back" size={26} /></button>
        <h1 className="text-[22px]">Ajustes</h1>
      </header>

      <div className="mx-auto w-full max-w-2xl px-[18px] pb-10 pt-2 lg:px-7 lg:pt-4">
        <div className="card row gap14 mb-[18px] p-3.5">
          <Avatar name={user?.displayName ?? 'Tú'} size={54} ring src={user?.avatar?.url} className="overflow-hidden" style={{ fontSize: 20 }} />
          <div className="grow min-w-0">
            <div className="font-display text-[19px]">{user?.displayName ?? 'Tú'}</div>
            <div className="faint mono mt-0.5 truncate text-[11.5px]">{user?.email}</div>
          </div>
          <button className="chip" onClick={() => setEditOpen(true)}>Editar</button>
        </div>

        <Group label="Cuenta">
          <div className="cursor-pointer" onClick={() => navigate('/perfil')}>
            <Row icon="user" t="Perfil público" sub={`@${user?.username ?? ''}`} />
          </div>
          {user?.role !== 'guide' && (
            <div className="cursor-pointer" onClick={() => setGuideOpen(true)}>
              <Row icon="shield" t="Solicitar rol de guía" sub="Verifica tu titulación" tone="var(--terra)" right={<span className="chip chip--terra">Nuevo</span>} />
            </div>
          )}
          <div className="cursor-pointer" onClick={() => setPrivacyOpen(true)}>
            <Row icon="lock" t="Privacidad y seguridad" sub="Email, contraseña y visibilidad" last />
          </div>
        </Group>

        <Group label="Preferencias">
          <Row
            icon="bell"
            t="Notificaciones push"
            right={
              <Toggle
                checked={settings?.notifications?.push ?? true}
                onChange={(v) => settingsMut.mutate({ notifications: { push: v } })}
                label="push"
              />
            }
          />
          <Row
            icon="globe"
            t="Salidas públicas por defecto"
            sub="Tus salidas se ven en Explorar"
            right={
              <Toggle
                checked={settings?.defaultTripVisibility === 'public'}
                onChange={(v) => settingsMut.mutate({ defaultTripVisibility: v ? 'public' : 'private' })}
                label="públicas"
              />
            }
          />
          <Row
            icon="mountain-snow"
            t="Tema"
            sub={theme === 'dark' ? 'Vivac nocturno' : 'Amanecer'}
            right={
              <button
                onClick={toggleTheme}
                className="row gap8 rounded-pill bg-bg-3 py-1.5 pl-3 pr-3.5 shadow-[inset_0_0_0_1px_var(--line)]"
                aria-label="Cambiar tema"
              >
                <span className="relative grid place-items-center">
                  <Icon name="mountain-snow" size={18} className="text-accent" />
                  <Icon
                    name={theme === 'dark' ? 'moon' : 'sun'}
                    size={11}
                    className={`absolute -right-2 -top-1.5 ${theme === 'dark' ? 'text-sky' : 'text-terra'}`}
                  />
                </span>
                <span className="mono text-[12px]">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
              </button>
            }
          />
          <Row
            icon="ruler"
            t="Unidades"
            sub={settings?.units === 'imperial' ? 'Imperial · pies, millas, lb' : 'Métrico · metros, km, kg'}
            right={
              <Toggle
                checked={settings?.units === 'imperial'}
                onChange={(v) => settingsMut.mutate({ units: v ? 'imperial' : 'metric' })}
                label="unidades"
              />
            }
            last
          />
        </Group>

        <Group label="Soporte">
          <div className="cursor-pointer" onClick={() => navigate('/ayuda')}>
            <Row icon="chat" t="Centro de ayuda" />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/terminos')}>
            <Row icon="note" t="Términos y privacidad" last />
          </div>
        </Group>

        <button
          className="btn btn--ghost btn--block"
          style={{ color: 'var(--terra)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb,var(--terra) 40%,transparent)' }}
          onClick={logout}
        >
          Cerrar sesión
        </button>
        <p className="faint mono mt-3.5 text-center text-[11px]">YourVivac · v1.0.0</p>
      </div>
      <GuideApplyModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </AppShell>
  );
}
