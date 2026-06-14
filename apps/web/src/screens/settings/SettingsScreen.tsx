import { AppShell } from '@/components/AppShell';
import { Avatar, Icon, Toggle, type IconName } from '@/ui';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

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
  const { theme, setTheme } = useUiStore();
  const { user, clear } = useAuthStore();

  return (
    <AppShell topbar={{ title: 'Ajustes', sub: 'Cuenta' }}>
      <div className="mx-auto w-full max-w-2xl px-[18px] pb-6 lg:px-7 lg:pt-4">
        <div className="card row gap14 mb-[18px] p-3.5">
          <Avatar name={user?.displayName ?? 'Marcos Vidal'} size={54} ring style={{ fontSize: 20 }} />
          <div className="grow">
            <div className="font-display text-[19px]">{user?.displayName ?? 'Marcos Vidal'}</div>
            <div className="faint mono mt-0.5 text-[11.5px]">{user?.email ?? 'marcos.vidal@gmail.com'}</div>
          </div>
          <span className="chip cursor-pointer">Editar</span>
        </div>

        <Group label="Cuenta">
          <Row icon="user" t="Perfil público" sub={`@${user?.username ?? 'marcosvidal'}`} />
          <Row icon="shield" t="Solicitar rol de guía" sub="Verifica tu titulación" tone="var(--terra)" right={<span className="chip chip--terra">Nuevo</span>} />
          <Row icon="lock" t="Privacidad y seguridad" last />
        </Group>

        <Group label="Preferencias">
          <Row icon="bell" t="Notificaciones push" right={<Toggle checked onChange={() => {}} label="push" />} />
          <Row icon="globe" t="Salidas públicas por defecto" sub="Tus salidas se ven en Explorar" right={<Toggle checked={false} onChange={() => {}} label="públicas" />} />
          <Row
            icon="image"
            t="Tema oscuro"
            sub={theme === 'dark' ? 'Oscuro' : 'Claro'}
            right={<Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} label="tema" />}
          />
          <Row icon="ruler" t="Unidades" sub="Métrico · metros, km, kg" last />
        </Group>

        <Group label="Soporte">
          <Row icon="chat" t="Centro de ayuda" />
          <Row icon="note" t="Términos y privacidad" last />
        </Group>

        <button
          className="btn btn--ghost btn--block"
          style={{ color: 'var(--terra)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb,var(--terra) 40%,transparent)' }}
          onClick={() => clear()}
        >
          Cerrar sesión
        </button>
        <p className="faint mono mt-3.5 text-center text-[11px]">YourVivac · v1.0.0</p>
      </div>
    </AppShell>
  );
}
