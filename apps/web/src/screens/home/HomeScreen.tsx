import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { FeedItem } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { NotificationsBell } from '@/components/NotificationsBell';
import { TripCard } from '@/components/cards';
import { Avatar, Icon, Logo } from '@/ui';
import { api } from '@/lib/api';
import { relativeTime, tripToCard } from '@/lib/format';
import { useAuthStore } from '@/stores/authStore';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-mono text-[13px] uppercase tracking-[0.08em] text-ink-3">{children}</h3>
);

const FEED_VERB: Record<FeedItem['type'], string> = {
  trip_completed: 'completó una salida',
  tip_published: 'publicó un consejo',
  achievement: 'consiguió un logro',
};

function FeedRow({ item }: { item: FeedItem }) {
  const title = item.trip?.title ?? item.tip?.title ?? '';
  const cover = item.trip?.cover?.url ?? item.tip?.cover?.url;
  return (
    <article className="card mb-3 p-3.5">
      <div className="row gap10">
        <Avatar name={item.actor.displayName} size={40} />
        <div className="grow min-w-0">
          <div className="row gap6 flex-wrap">
            <strong className="text-[15px]">{item.actor.displayName}</strong>
            {item.actor.guide?.status === 'approved' && (
              <span className="chip chip--guide" style={{ fontSize: 9.5, padding: '2px 7px' }}>
                <Icon name="shield" size={11} /> Guía
              </span>
            )}
          </div>
          <div className="faint text-[12.5px]">
            {FEED_VERB[item.type]} · {relativeTime(item.createdAt)}
          </div>
        </div>
      </div>
      {title && <h3 className="mt-3 text-[21px]">{title}</h3>}
      {cover && (
        <div
          className="mt-3 h-[150px] rounded-card bg-cover bg-center"
          style={{ backgroundImage: `url(${cover})` }}
        />
      )}
    </article>
  );
}

export function HomeScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const name = user?.displayName?.split(' ')[0] ?? 'montañero';

  const tripsQ = useQuery({ queryKey: ['trips'], queryFn: () => api.trips.list(), retry: false });
  const feedQ = useQuery({ queryKey: ['feed'], queryFn: () => api.feed.home(), retry: false });
  const tipsQ = useQuery({ queryKey: ['tips', 'recent'], queryFn: () => api.tips.feed({ pageSize: 4 }), retry: false });

  const trips = tripsQ.data ?? [];
  const upcoming = trips.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const feed = feedQ.data?.items ?? [];
  const tips = tipsQ.data?.items ?? [];

  return (
    <AppShell topbar={{ title: `Hola, ${name}`, sub: `Tu cordada · ${upcoming.length} salidas en preparación` }}>
      {/* Cabecera móvil */}
      <header className="spread flex-none px-[18px] pb-3 pt-1.5 lg:hidden">
        <Logo size={19} />
        <div className="row gap14">
          <button onClick={() => navigate('/explorar')} aria-label="Explorar">
            <Icon name="search" size={22} />
          </button>
          <NotificationsBell />
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl">
        <div className="px-[18px] lg:hidden">
          <h1 className="text-[27px]">Hola, {name}</h1>
          <p className="muted mt-1 text-[14.5px]">
            Tienes <span className="accent">{upcoming.length} salidas</span> en preparación.
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

            {tripsQ.isLoading ? (
              <div className="faint px-[18px] py-6 text-sm lg:px-0">Cargando salidas…</div>
            ) : upcoming.length === 0 ? (
              <div className="card mx-[18px] p-5 text-center lg:mx-0">
                <p className="muted text-sm">Aún no tienes salidas. ¡Crea la primera!</p>
                <button className="btn mt-3" onClick={() => navigate('/crear')}>
                  <Icon name="plus" size={16} /> Nueva salida
                </button>
              </div>
            ) : (
              <div className="row gap12 overflow-x-auto px-[18px] pb-1 lg:flex-wrap lg:px-0">
                {upcoming.map((t) => (
                  <TripCard key={t.id} {...tripToCard(t)} onClick={() => navigate(`/salida/${t.id}`)} />
                ))}
              </div>
            )}

            <div className="spread px-[18px] pb-2.5 pt-6 lg:px-0">
              <SectionTitle>De tu cordada</SectionTitle>
            </div>
            <div className="px-[18px] pb-5 lg:px-0">
              {feedQ.isLoading ? (
                <div className="faint py-6 text-sm">Cargando actividad…</div>
              ) : feed.length === 0 ? (
                <div className="card p-5 text-center">
                  <p className="muted text-sm">
                    Sigue a otros montañeros para ver su actividad aquí.
                  </p>
                  <button className="btn btn--ghost mt-3" onClick={() => navigate('/explorar')}>
                    Explorar gente
                  </button>
                </div>
              ) : (
                feed.map((f) => <FeedRow key={f.activityId} item={f} />)
              )}
            </div>
          </div>

          {/* Panel derecho (escritorio) */}
          <aside className="hidden w-[300px] flex-none pt-1 lg:block">
            <h3 className="mb-3.5 font-display text-[18px]">Tu temporada</h3>
            <div className="card mb-5 grid grid-cols-2 gap-3 p-3.5">
              {[
                ['Salidas', user?.stats?.trips ?? 0],
                ['Vivacs', user?.stats?.vivacs ?? 0],
                ['Km', user?.stats?.distanceKm ?? 0],
                ['Desnivel+', user?.stats?.elevationGain ?? 0],
              ].map(([label, val]) => (
                <div key={label} className="rounded-control bg-bg-3 px-3 py-2.5">
                  <div className="faint eyebrow">{label}</div>
                  <div className="mono mt-1 text-[20px] text-accent">{val}</div>
                </div>
              ))}
            </div>

            <h3 className="mb-3 font-display text-[18px]">Consejos para tu vivac</h3>
            <div className="stack gap10">
              {tips.length === 0 ? (
                <div className="faint text-sm">Aún no hay consejos publicados.</div>
              ) : (
                tips.map((t) => (
                  <div
                    key={t.id}
                    className="card row gap10 cursor-pointer p-3"
                    onClick={() => navigate('/consejos')}
                  >
                    <div
                      className="imgslot topo none h-12 w-12 flex-none rounded-pin bg-cover bg-center"
                      style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined}
                    />
                    <div className="grow min-w-0">
                      <div className="font-display text-sm leading-tight">{t.title}</div>
                      <div className="faint mono mt-1.5 text-[10.5px]">{t.readMinutes}′ de lectura</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
