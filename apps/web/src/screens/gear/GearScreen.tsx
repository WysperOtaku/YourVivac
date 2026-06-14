import { AppShell } from '@/components/AppShell';
import { Icon, type IconName } from '@/ui';

const LISTS: { n: string; items: string; kg: string; icon: IconName; tone: string; used: string }[] = [
  { n: 'Vivac de verano', items: '12 ítems', kg: '6,4', icon: 'mountain', tone: 'var(--accent)', used: '3 salidas' },
  { n: 'Alpinismo invernal', items: '18 ítems', kg: '9,1', icon: 'layers', tone: 'var(--sky)', used: '2 salidas' },
  { n: 'Travesía ligera', items: '9 ítems', kg: '4,2', icon: 'route', tone: 'var(--terra)', used: '5 salidas' },
];
const OWNED: { t: string; store: string; label: string; w: string }[] = [
  { t: 'Saco Trangoworld -5 ºC', store: 'amazon', label: 'Amazon', w: '1.180 g' },
  { t: 'Esterilla Forclaz MT500', store: 'decath', label: 'Decathlon', w: '480 g' },
  { t: 'Crampones Camp Stalker', store: 'barrabes', label: 'Barrabés', w: '920 g' },
];
const STORES: [string, string][] = [
  ['amazon', 'Amazon'],
  ['decath', 'Decathlon'],
  ['deporv', 'Deporvillage'],
  ['barrabes', 'Barrabés'],
  ['forum', 'Forum'],
  ['coleman', 'Coleman'],
];

export function GearScreen() {
  return (
    <AppShell topbar={{ title: 'Mi equipo', sub: 'Material' }}>
      <div className="mx-auto w-full max-w-4xl px-[18px] lg:px-7 lg:pt-4">
        <div className="flex-none pb-1.5 lg:hidden">
          <h1 className="text-[26px]">Mi equipo</h1>
          <p className="muted mt-0.5 text-sm">Tus listas reutilizables y tu material guardado.</p>
        </div>

        <div className="spread mb-2.5 mt-2">
          <span className="eyebrow">Mis listas</span>
          <span className="accent row gap4 mono cursor-pointer text-[12.5px]">
            <Icon name="plus" size={13} /> Nueva lista
          </span>
        </div>
        <div className="stack gap10 lg:grid lg:grid-cols-2 lg:gap-3 lg:[&>*]:m-0">
          {LISTS.map((l, i) => (
            <div key={i} className="card row gap12 p-3.5">
              <div
                className="grid h-[46px] w-[46px] place-items-center rounded-[13px]"
                style={{ color: l.tone, boxShadow: `inset 0 0 0 1px color-mix(in srgb,${l.tone} 38%,transparent)` }}
              >
                <Icon name={l.icon} size={22} />
              </div>
              <div className="grow min-w-0">
                <div className="font-display text-[17px]">{l.n}</div>
                <div className="faint mono mt-0.5 text-[11px]">
                  {l.items} · {l.kg} kg · usada en {l.used}
                </div>
              </div>
              <Icon name="chevron" size={18} className="text-ink-3" />
            </div>
          ))}
        </div>

        <div className="spread mb-2.5 mt-6">
          <span className="eyebrow">Mi material guardado</span>
          <span className="faint mono text-xs">24 ítems</span>
        </div>
        <div className="card px-3.5 py-1">
          {OWNED.map((o, i) => (
            <div key={i} className={`row gap12 py-2.5 ${i < OWNED.length - 1 ? 'border-b border-[var(--line)]' : ''}`}>
              <div className="imgslot topo none h-[42px] w-[42px] rounded-pin" />
              <div className="grow min-w-0">
                <div className="text-[14.5px]">{o.t}</div>
                <div className="row gap8 mt-1.5">
                  <span className={`store store--${o.store}`}>{o.label}</span>
                  <span className="faint mono text-[11px]">{o.w}</span>
                </div>
              </div>
              <Icon name="more" size={18} className="text-ink-3" />
            </div>
          ))}
        </div>

        <div className="card mb-6 mt-4 bg-bg-3 p-4">
          <div className="row gap8">
            <Icon name="search" size={18} className="text-accent" />
            <strong className="text-[14.5px]">Buscar material en tiendas</strong>
          </div>
          <p className="faint mt-1.5 text-[12.5px]">
            Un solo buscador para Amazon, Decathlon, Deporvillage, Barrabés, Forum Sport y Coleman.
          </p>
          <div className="row gap6 flex-wrap mt-2.5">
            {STORES.map(([k, l]) => (
              <span key={k} className={`store store--${k}`}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
