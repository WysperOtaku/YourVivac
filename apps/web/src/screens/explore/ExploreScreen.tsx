import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';

const TRIPS = [
  { n: 'Vivac en Monte Perdido', who: 'Bea L.', t: 't' as const, m: '1.610', k: '92' },
  { n: 'Travesía Carros de Foc', who: 'Diego R.', t: 's' as const, m: '3.200', k: '146' },
  { n: 'Luna llena en Gredos', who: 'Sara V.', t: '' as const, m: '880', k: '57' },
  { n: 'Cresta de los Infiernos', who: 'Iker M.', t: 's' as const, m: '1.340', k: '73' },
];
const FILTERS = ['Salidas públicas', 'Consejos', 'Gente'];

export function ExploreScreen() {
  const [active, setActive] = useState(0);
  return (
    <AppShell topbar={{ title: 'Explorar', sub: 'Descubre' }}>
      <div className="mx-auto w-full max-w-4xl px-[18px] lg:px-7 lg:pt-4">
        <header className="flex-none pb-3 pt-1.5 lg:hidden">
          <div className="spread">
            <h1 className="text-[25px]">Explorar</h1>
            <Icon name="filter" size={22} />
          </div>
        </header>
        <div className="row gap10 rounded-control bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
          <Icon name="search" size={18} className="text-ink-3" />
          <span className="faint text-[15px]">Busca picos, rutas o personas…</span>
        </div>
        <div className="row gap6 mt-3">
          {FILTERS.map((f, i) => (
            <span
              key={f}
              onClick={() => setActive(i)}
              className={`chip grow cursor-pointer justify-center py-1.5 ${i === active ? 'chip--accent' : ''}`}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Destacado */}
        <div className="card mt-4 overflow-hidden">
          <div className="imgslot topo h-[170px] items-end justify-between">
            <span className="chip m-3 backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 62%,transparent)' }}>
              <Icon name="star" size={12} className="text-terra" /> Destacado
            </span>
            <span className="chip mono m-3 backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 62%,transparent)' }}>
              3.200 m+
            </span>
          </div>
          <div className="px-4 pb-4 pt-3">
            <h2 className="text-[22px]">Carros de Foc en 4 días</h2>
            <p className="muted mt-1.5 text-sm">
              Travesía completa por los refugios de Aigüestortes. Ruta pública de Diego.
            </p>
            <div className="row gap8 mt-3">
              <Avatar name="Diego R" tone="s" size={28} />
              <span className="grow text-[13.5px]">Diego Romero</span>
              <span className="chip">
                <Icon name="heart" size={12} /> 146
              </span>
              <span className="chip">
                <Icon name="download" size={12} /> GPX
              </span>
            </div>
          </div>
        </div>

        <div className="spread my-3">
          <h3 className="eyebrow">Salidas públicas cerca</h3>
          <span className="faint mono text-xs">Pirineos</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pb-6 md:grid-cols-3 lg:grid-cols-4">
          {TRIPS.map((tp, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="imgslot topo h-[96px] items-start">
                <span className="chip mono m-2" style={{ fontSize: 9.5, padding: '2px 7px', background: 'color-mix(in srgb,var(--bg) 60%,transparent)' }}>
                  {tp.m} m+
                </span>
              </div>
              <div className="px-2.5 pb-2.5 pt-2.5">
                <div className="font-display text-[15px] leading-tight">{tp.n}</div>
                <div className="row gap6 mt-2">
                  <Avatar name={tp.who} tone={tp.t} size={20} style={{ fontSize: 9 }} />
                  <span className="faint text-xs">{tp.who}</span>
                  <span className="grow" />
                  <span className="faint mono row gap4 text-[10.5px]">
                    <Icon name="heart" size={11} /> {tp.k}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
