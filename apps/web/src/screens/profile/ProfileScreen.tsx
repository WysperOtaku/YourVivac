import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { useAuthStore } from '@/stores/authStore';

const ACHIEVEMENTS: [Parameters<typeof Icon>[0]['name'], string, string][] = [
  ['trophy', '10 tresmiles', 'var(--terra)'],
  ['flag', 'GR-11', 'var(--accent)'],
  ['star', 'Madrugador', 'var(--sky)'],
  ['mountain', 'Aneto x3', 'var(--ink-2)'],
];
const TRIPS = [
  { n: 'Aneto · 3.404 m', d: 'JUN 25', m: '1.420' },
  { n: 'Posets', d: 'ABR 25', m: '1.310' },
  { n: 'Gredos', d: 'FEB 25', m: '980' },
  { n: 'Ordesa', d: 'OCT 24', m: '1.150' },
];

function Stat({ n, label, tone }: { n: string; label: string; tone?: string }) {
  return (
    <div className="stack flex-1 items-center">
      <span className="mono text-[23px] leading-none" style={{ color: tone ?? 'var(--ink)' }}>
        {n}
      </span>
      <span className="eyebrow mt-1.5" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}

export function ProfileScreen({ guide = false }: { guide?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const name = user?.displayName ?? 'Marcos Vidal';
  const [tab, setTab] = useState<'salidas' | 'consejos' | 'mapa'>('salidas');
  const isGuide = guide || user?.role === 'guide';

  return (
    <AppShell topbar={{ title: name, sub: 'Perfil' }}>
      {/* Cabecera móvil */}
      <header className="spread flex-none px-[18px] pb-1 pt-1.5 lg:hidden">
        <Icon name="back" size={26} />
        <div className="row gap16">
          <Icon name="share" size={22} />
          <Icon name="settings" size={22} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-[18px] lg:px-7 lg:pt-4">
        <div className="relative pt-2">
          <div className="topo-bg" style={{ height: 120, bottom: 'auto', opacity: 0.6 }} />
          <div className="row gap14 relative">
            <Avatar name={name} size={84} ring style={{ fontSize: 30 }} />
            <div className="grow pt-1">
              <div className="row gap8 flex-wrap">
                <h2 className="text-[24px]">{name}</h2>
                {isGuide && (
                  <span className="chip chip--guide">
                    <Icon name="shield" size={12} /> Guía certificado
                  </span>
                )}
              </div>
              <div className="faint row gap6 mono mt-1 text-[12.5px]">
                <Icon name="pin" size={13} /> Jaca, Huesca · desde 2023
              </div>
            </div>
          </div>
          <p className="muted mt-3 text-[14.5px]">
            {isGuide
              ? 'Técnico deportivo en media montaña. Ayudo a planificar travesías seguras por el Pirineo aragonés.'
              : 'Fin de semana = mochila y botas. Coleccionando tresmiles del Pirineo, uno a uno.'}
          </p>
          <div className="row gap8 mt-3">
            <button className="btn flex-1">Seguir</button>
            <button className="btn btn--ghost flex-1">Mensaje</button>
            {isGuide && <button className="btn btn--terra none" style={{ padding: '11px 14px' }}>Pedir ayuda</button>}
          </div>
        </div>

        <div className="card mt-[18px] px-2 py-4">
          <div className="row">
            <Stat n="38" label="Salidas" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="14" label="Vivacs" tone="var(--accent)" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="612" label="km" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="9.2k" label="Desnivel+" tone="var(--terra)" />
          </div>
        </div>

        <div className="row gap10 overflow-x-auto pb-1 pt-4">
          {ACHIEVEMENTS.map(([ic, t, c], i) => (
            <div key={i} className="card stack gap8 min-w-[78px] flex-none items-center px-2.5 py-3">
              <div
                className="grid h-[38px] w-[38px] place-items-center rounded-pin"
                style={{ color: c, boxShadow: `inset 0 0 0 1px color-mix(in srgb,${c} 40%,transparent)` }}
              >
                <Icon name={ic} size={22} />
              </div>
              <span className="mono text-center text-[10px] text-ink-2">{t}</span>
            </div>
          ))}
        </div>

        <div className="row gap20 border-b border-[var(--line)] pt-4">
          {(['salidas', 'consejos', 'mapa'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2.5 text-[14.5px] capitalize ${tab === t ? 'border-b-2 border-accent text-ink' : 'faint'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 py-3.5 md:grid-cols-3 lg:grid-cols-4">
          {TRIPS.map((t, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="imgslot topo h-[84px] items-start">
                <span className="chip mono m-2" style={{ fontSize: 9.5, padding: '2px 7px', background: 'color-mix(in srgb,var(--bg) 60%,transparent)' }}>
                  {t.d}
                </span>
              </div>
              <div className="px-2.5 pb-2.5 pt-2">
                <div className="font-display text-[14.5px]">{t.n}</div>
                <div className="faint mono row gap4 mt-1 text-[11px]">
                  <Icon name="elev" size={12} /> {t.m} m+
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
