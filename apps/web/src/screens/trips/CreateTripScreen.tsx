import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';

const DIFFS = ['Fácil', 'Moderada', 'Difícil', 'Alpina'];
const FRIENDS = [
  { n: 'Lucía R', t: 't' as const, on: true },
  { n: 'Iker M', t: 's' as const, on: true },
  { n: 'Ana P', t: '' as const, on: false },
  { n: 'Bea L', t: 't' as const, on: false },
  { n: 'Diego', t: 's' as const, on: false },
  { n: 'Sara V', t: '' as const, on: false },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="stack gap6 mb-4">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}
const inputCls =
  'w-full rounded-control bg-bg-2 px-3.5 py-3 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]';

export function CreateTripScreen() {
  const navigate = useNavigate();
  const [diff, setDiff] = useState(1);
  const [invited, setInvited] = useState<Record<string, boolean>>({ 'Lucía R': true, 'Iker M': true });
  const count = Object.values(invited).filter(Boolean).length;

  return (
    <AppShell topbar={{ title: 'Nueva salida', sub: 'Paso 1 de 2 · Detalles' }} bareDesktop>
      <header className="row gap12 flex-none px-[18px] pb-2.5 pt-2 lg:px-7 lg:pt-5">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="lg:hidden">
          <Icon name="back" size={26} />
        </button>
        <div className="grow">
          <h3 className="text-[19px] lg:text-[25px]">Nueva salida</h3>
          <div className="eyebrow mt-0.5">Paso 1 de 2 · Detalles</div>
        </div>
        <span className="faint mono cursor-pointer text-[13px]" onClick={() => navigate('/')}>
          Cancelar
        </span>
      </header>

      <div className="mx-auto w-full max-w-2xl px-[18px] pb-28 lg:px-7">
        <div className="imgslot topo mb-4 flex h-[132px] items-center justify-center rounded-card">
          <div className="stack gap6 items-center">
            <div className="grid h-[42px] w-[42px] place-items-center rounded-pin backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 65%,transparent)' }}>
              <Icon name="camera" size={22} />
            </div>
            <span className="mono faint text-[11px]">Añade portada o mapa</span>
          </div>
        </div>

        <Field label="Nombre de la salida">
          <input className={inputCls} defaultValue="Vivac en el Aneto" />
        </Field>
        <div className="row gap12">
          <div className="grow">
            <Field label="Salida">
              <input className={`${inputCls} mono`} defaultValue="14 jun, 06:00" />
            </Field>
          </div>
          <div className="grow">
            <Field label="Regreso">
              <input className={`${inputCls} mono`} defaultValue="15 jun, 18:00" />
            </Field>
          </div>
        </div>
        <Field label="Lugar / punto de inicio">
          <input className={inputCls} defaultValue="Refugio de la Renclusa, Benasque" />
        </Field>
        <Field label="Dificultad">
          <div className="row gap8 flex-wrap">
            {DIFFS.map((d, i) => (
              <span key={d} onClick={() => setDiff(i)} className={`chip cursor-pointer ${i === diff ? 'chip--accent' : ''}`}>
                {d}
              </span>
            ))}
          </div>
        </Field>

        <div className="spread mb-2.5 mt-1.5">
          <span className="eyebrow">Invita a tu gente</span>
          <span className="accent mono text-xs">{count} seleccionados</span>
        </div>
        <div className="row gap10 mb-3 rounded-control bg-bg-2 px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
          <Icon name="search" size={18} className="text-ink-3" />
          <span className="faint text-[15px]">Busca amigos o pega un enlace…</span>
        </div>
        <div className="stack">
          {FRIENDS.map((f, i) => {
            const on = invited[f.n] ?? false;
            return (
              <div key={i} className={`row gap12 py-2 ${i < FRIENDS.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                <Avatar name={f.n} tone={f.t} size={38} />
                <div className="grow">
                  <div className="text-[15px]">{f.n}</div>
                  <div className="faint mono text-[11px]">{on ? 'se apunta' : '@' + f.n.toLowerCase().replace(/ /g, '')}</div>
                </div>
                <button
                  onClick={() => setInvited((s) => ({ ...s, [f.n]: !on }))}
                  className="grid h-[30px] w-[30px] place-items-center rounded-[9px]"
                  style={
                    on
                      ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                      : { color: 'var(--ink-3)', boxShadow: 'inset 0 0 0 1.5px var(--line-2)' }
                  }
                >
                  <Icon name={on ? 'check' : 'plus'} size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[68px] flex-none bg-bg-2 px-[18px] py-3 shadow-[inset_0_1px_0_var(--line)] lg:bottom-0 lg:left-60">
        <div className="mx-auto max-w-2xl">
          <button className="btn btn--block btn--lg" onClick={() => navigate('/salida/nueva/tablero')}>
            Continuar al tablero <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
