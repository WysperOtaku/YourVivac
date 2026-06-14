import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';

const KPIS: [string, string, string, string][] = [
  ['Usuarios', '12.480', '+312 esta semana', 'var(--accent)'],
  ['Salidas creadas', '3.927', '+148', 'var(--ink)'],
  ['Consejos publicados', '612', '+24', 'var(--sky)'],
  ['Guías verificados', '38', '+3', 'var(--terra)'],
];
const QUEUE = [
  { n: 'Lucía Roldán', mail: 'lucia.r@gmail.com', cert: 'TD Media Montaña · FEDME', date: 'hoy', t: 't' as const },
  { n: 'Diego Romero', mail: 'diego@guiaspirineos.es', cert: 'Guía AEGM', date: 'ayer', t: 's' as const },
  { n: 'Bea López', mail: 'bea.lopez@gmail.com', cert: 'TD Escalada', date: '2 jun', t: 't' as const },
];
const REPORTS: [string, string, string][] = [
  ['Comentario ofensivo', 'Salida #2841', 'Pendiente'],
  ['Enlace roto a tienda', 'Consejo #517', 'Resuelto'],
];
const BARS = [40, 55, 38, 70, 62, 88, 75];

export function AdminScreen() {
  return (
    <AppShell topbar={{ title: 'Resumen', sub: 'Panel de administración' }}>
      <div className="px-[18px] pb-6 pt-3 lg:px-7 lg:pt-5">
        <div className="lg:hidden">
          <span className="chip chip--terra mb-3 inline-flex">
            <Icon name="lock" size={12} /> Admin
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {KPIS.map(([l, n, d, c], i) => (
            <div key={i} className="card px-4 py-4">
              <div className="eyebrow">{l}</div>
              <div className="mono mt-1.5 text-[30px]" style={{ color: c }}>
                {n}
              </div>
              <div className="faint mono mt-1 text-[11.5px]">{d}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
          {/* Cola de verificación */}
          <div className="card grow overflow-hidden">
            <div className="spread px-4 py-4 shadow-[inset_0_-1px_0_var(--line)]">
              <div className="row gap8">
                <Icon name="shield" size={18} className="text-terra" />
                <h3 className="font-display text-[18px]">Verificación de guías</h3>
              </div>
              <span className="chip chip--terra">4 pendientes</span>
            </div>
            <div className="px-4 pb-3 pt-1">
              {QUEUE.map((q, i) => (
                <div key={i} className={`row gap10 flex-wrap py-3 ${i < QUEUE.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                  <div className="row gap10 min-w-0 grow">
                    <Avatar name={q.n} tone={q.t} size={32} />
                    <div className="min-w-0">
                      <div className="text-sm">{q.n}</div>
                      <div className="faint mono text-[10.5px]">{q.mail}</div>
                    </div>
                  </div>
                  <span className="chip" style={{ fontSize: 10.5 }}>
                    {q.cert}
                  </span>
                  <span className="faint mono self-center text-xs">{q.date}</span>
                  <div className="row gap6 justify-end">
                    <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent text-accent-ink">
                      <Icon name="check" size={18} />
                    </span>
                    <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]">
                      <Icon name="x" size={18} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reportes + actividad */}
          <div className="stack gap16 w-full flex-none lg:w-[300px]">
            <div className="card overflow-hidden">
              <div className="spread px-4 py-3.5 shadow-[inset_0_-1px_0_var(--line)]">
                <div className="row gap8">
                  <Icon name="flag" size={18} className="text-terra" />
                  <h3 className="font-display text-[17px]">Reportes</h3>
                </div>
              </div>
              <div className="px-4 pb-2.5 pt-1">
                {REPORTS.map(([t, src, st], i) => (
                  <div key={i} className={`row gap10 py-3 ${i < REPORTS.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
                    <div className="grow">
                      <div className="text-[13.5px]">{t}</div>
                      <div className="faint mono mt-0.5 text-[10.5px]">{src}</div>
                    </div>
                    <span className={`chip ${st === 'Resuelto' ? 'chip--accent' : 'chip--terra'}`} style={{ fontSize: 10 }}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card px-4 py-4">
              <h3 className="mb-3 font-display text-[17px]">Nuevos usuarios</h3>
              <div className="row gap6 h-20 items-end">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="grow rounded"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? 'var(--accent)' : 'var(--bg-4)',
                      boxShadow: i === 5 ? 'none' : 'inset 0 0 0 1px var(--line)',
                    }}
                  />
                ))}
              </div>
              <div className="row spread mono faint mt-1.5 text-[10px]">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
