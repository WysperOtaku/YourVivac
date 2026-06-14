import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { TripCard, FeedCard, type Member } from '@/components/cards';
import { Avatar, Icon, Logo } from '@/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const DEMO_TRIPS = [
  { name: 'Vivac en el Aneto', place: 'Benasque, Huesca', date: '14 JUN', m: '1.180', dist: '22', status: 'Confirmada', members: [{ n: 'Marcos' }, { n: 'Lucía', t: 't' }, { n: 'Iker', t: 's' }, { n: 'Ana' }] as Member[] },
  { name: 'Travesía GR-11', place: 'Pirineo navarro', date: '2 JUL', m: '2.400', dist: '48', status: 'Planeando', members: [{ n: 'Marcos' }, { n: 'Bea', t: 't' }] as Member[] },
];
const DEMO_FEED = [
  { who: 'Lucía Roldán', tone: 't' as const, guide: true, place: 'Pico Aneto · 3.404 m', name: 'Amanecer en el Aneto', m: '1.420', dist: '24', time: 'hace 2 días', kudos: 34, comments: 6, photo: 'cima del aneto' },
  { who: 'Iker Mendi', tone: 's' as const, place: 'Circo de Gredos', name: 'Vivac en la Laguna Grande', m: '980', dist: '17', time: 'hace 5 días', kudos: 21, comments: 3, photo: 'laguna al alba' },
];
const RANKING: [string, '' | 't' | 's', string, boolean][] = [
  ['Lucía Roldán', 't', '22', true],
  ['Marcos Vidal', '', '18', false],
  ['Iker Mendi', 's', '15', false],
  ['Ana Gil', '', '11', false],
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-3">{children}</h3>
);

export function HomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const name = user?.displayName?.split(' ')[0] ?? 'montañero';

  const { data: trips } = useQuery({ queryKey: ['trips'], queryFn: () => api.trips.list(), retry: false });
  const tripsToShow = trips && trips.length > 0 ? trips.map((t) => ({
    name: t.title,
    place: t.location?.name ?? '',
    date: new Date(t.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase(),
    m: String(t.elevationGain ?? 0),
    dist: String(t.distanceKm ?? 0),
    status: t.status === 'confirmed' ? 'Confirmada' : 'Planeando',
    members: (t.members ?? []).map((mm) => ({ n: String(mm.userId).slice(0, 6) })) as Member[],
  })) : DEMO_TRIPS;

  return (
    <AppShell topbar={{ title: `Hola, ${name}`, sub: 'Tu cordada · 2 salidas en preparación' }}>
      {/* Cabecera móvil */}
      <header className="spread flex-none px-[18px] pb-3 pt-1.5 lg:hidden">
        <Logo size={19} />
        <div className="row gap14">
          <Icon name="search" size={22} />
          <span className="relative">
            <Icon name="bell" size={22} />
            <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-terra" />
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <div className="px-[18px] lg:hidden">
          <h1 className="text-[27px]">Hola, {name}</h1>
          <p className="muted mt-1 text-[14.5px]">
            Tienes <span className="accent">2 salidas</span> en preparación.
          </p>
        </div>

        <div className="lg:flex lg:gap-7 lg:px-7 lg:pt-5">
          {/* Columna central */}
          <div className="min-w-0 lg:flex-1">
            <div className="spread px-[18px] pb-2.5 pt-5 lg:px-0">
              <SectionTitle>Tus salidas</SectionTitle>
              <span className="faint row gap4 text-[13px] cursor-pointer" onClick={() => navigate('/salidas')}>
                Ver todas <Icon name="chevron" size={13} />
              </span>
            </div>
            <div className="row gap12 overflow-x-auto px-[18px] pb-1 lg:flex-wrap lg:px-0">
              {tripsToShow.map((t, i) => (
                <TripCard key={i} {...t} onClick={() => navigate('/salidas')} />
              ))}
            </div>

            <div className="spread px-[18px] pb-2.5 pt-6 lg:px-0">
              <SectionTitle>De tu cordada</SectionTitle>
              <span className="chip">
                <Icon name="filter" size={12} /> Todos
              </span>
            </div>
            <div className="px-[18px] pb-5 lg:px-0">
              {DEMO_FEED.map((f, i) => (
                <FeedCard key={i} {...f} />
              ))}
            </div>
          </div>

          {/* Panel derecho (escritorio) */}
          <aside className="hidden w-[300px] flex-none pt-1 lg:block">
            <h3 className="mb-3.5 font-display text-[18px]">Ranking de la temporada</h3>
            <div className="card mb-5 px-3.5 py-1.5">
              {RANKING.map(([n, t, c, g], i) => (
                <div
                  key={i}
                  className={`row gap12 py-2.5 ${i < 3 ? 'border-b border-[var(--line)]' : ''}`}
                >
                  <span className="mono faint w-4 text-[13px]">{i + 1}</span>
                  <Avatar name={n} tone={t} size={32} />
                  <div className="grow row gap6 min-w-0">
                    <span className="text-sm">{n.split(' ')[0]}</span>
                    {g && <Icon name="shield" size={13} className="text-terra" />}
                  </div>
                  <span className="mono text-sm text-accent">{c}</span>
                </div>
              ))}
            </div>
            <h3 className="mb-3 font-display text-[18px]">Consejos para tu vivac</h3>
            <div className="stack gap10">
              {[['Elegir saco según la cota', 'Lucía · Guía', true], ['Vivac responsable: no dejar rastro', 'Editorial YV', false]].map(
                ([t, a, g], i) => (
                  <div key={i} className="card row gap10 p-3">
                    <div className="imgslot topo none h-12 w-12 rounded-pin" />
                    <div className="grow">
                      <div className="font-display text-sm leading-tight">{t}</div>
                      <div className="faint mono row gap6 mt-1.5 text-[10.5px]">
                        {a}
                        {g && (
                          <span className="chip chip--guide" style={{ fontSize: 8, padding: '1px 5px' }}>
                            Guía
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
