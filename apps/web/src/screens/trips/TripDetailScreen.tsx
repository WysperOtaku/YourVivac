import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';

const MEMBERS: [string, '' | 't' | 's'][] = [
  ['Marcos', ''],
  ['Lucía', 't'],
  ['Iker', 's'],
  ['Ana', ''],
];

function Stat({ n, label, tone }: { n: string; label: string; tone?: string }) {
  return (
    <div className="stack flex-1 items-center">
      <span className="mono text-[22px] leading-none" style={{ color: tone ?? 'var(--ink)' }}>
        {n}
      </span>
      <span className="eyebrow mt-1.5" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}

export function TripDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AppShell topbar={{ title: 'Vivac en el Aneto', sub: '14–15 JUN · Benasque, Huesca' }} bareDesktop>
      <div className="mx-auto w-full max-w-3xl px-[18px] pb-6 lg:px-7 lg:pt-4">
        <header className="row gap12 flex-none pb-2 pt-2 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver">
            <Icon name="back" size={26} />
          </button>
          <div className="grow">
            <h3 className="text-[19px]">Vivac en el Aneto</h3>
            <div className="faint mono text-[11px]">14–15 JUN · Benasque, Huesca</div>
          </div>
        </header>

        <div className="imgslot topo relative h-[180px] items-end rounded-card">
          <span className="chip chip--accent m-3">Confirmada</span>
        </div>

        <div className="row gap8 flex-wrap mt-4">
          <span className="chip">
            <Icon name="calendar" size={13} /> 14–15 jun
          </span>
          <span className="chip">
            <Icon name="pin" size={13} /> Refugio de la Renclusa
          </span>
          <span className="chip chip--terra">Moderada</span>
        </div>

        <p className="muted mt-3 text-[15px]">
          Vivac de dos días al pico más alto del Pirineo. Subida por el glaciar y noche en altura. Material de
          alta montaña obligatorio.
        </p>

        <div className="card mt-4 px-2 py-4">
          <div className="row">
            <Stat n="1.180" label="Desnivel+" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="22" label="km" tone="var(--accent)" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="2" label="días" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n="4" label="van" tone="var(--terra)" />
          </div>
        </div>

        <div className="spread mt-5">
          <span className="eyebrow">Montañeros</span>
          <span className="accent mono text-xs">Invitar</span>
        </div>
        <div className="row gap10 mt-2.5 flex-wrap">
          {MEMBERS.map(([n, t], i) => (
            <div key={i} className="row gap8 rounded-pill bg-bg-2 py-1.5 pl-1.5 pr-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
              <Avatar name={n} tone={t} size={26} />
              <span className="text-[13px]">{n}</span>
            </div>
          ))}
        </div>

        <div className="row gap10 mt-6">
          <button className="btn grow" onClick={() => navigate(`/salida/${id}/tablero`)}>
            <Icon name="layers" size={18} /> Abrir tablero
          </button>
          <button className="btn btn--ghost grow" onClick={() => navigate(`/salida/${id}/chat`)}>
            <Icon name="chat" size={18} /> Chat del grupo
          </button>
        </div>
      </div>
    </AppShell>
  );
}
