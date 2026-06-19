import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { TripDifficulty } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { tripDifficultyLabel } from '@/lib/format';
import { TipReadModal } from '@/screens/tips/TipReadModal';

const TABS = ['Salidas públicas', 'Consejos'] as const;
const DIFFS: { key?: TripDifficulty; label: string }[] = [
  { label: 'Todas' },
  { key: 'facil', label: 'Fácil' },
  { key: 'moderada', label: 'Moderada' },
  { key: 'dificil', label: 'Difícil' },
  { key: 'alpina', label: 'Alpina' },
];

export function ExploreScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState(0);
  const [readSlug, setReadSlug] = useState<string | null>(null);

  const difficulty = DIFFS[diff]?.key;
  const tripsQ = useQuery({
    queryKey: ['explore-trips', q, difficulty],
    queryFn: () => api.trips.explore({ ...(q ? { q } : {}), ...(difficulty ? { difficulty } : {}) }),
    enabled: tab === 0,
    retry: false,
  });
  const tipsQ = useQuery({
    queryKey: ['explore-tips'],
    queryFn: () => api.tips.feed(),
    enabled: tab === 1,
    retry: false,
  });

  const trips = tripsQ.data?.items ?? [];
  const tips = tipsQ.data?.items ?? [];

  return (
    <AppShell topbar={{ title: 'Explorar', sub: 'Descubre' }}>
      <div className="mx-auto w-full max-w-4xl px-[18px] lg:px-7 lg:pt-4">
        <header className="flex-none pb-3 pt-1.5 lg:hidden">
          <h1 className="text-[25px]">Explorar</h1>
        </header>

        <div className="row gap10 rounded-control bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
          <Icon name="search" size={18} className="text-ink-3" />
          <input
            className="grow bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
            placeholder="Busca picos, rutas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="row gap6 mt-3">
          {TABS.map((f, i) => (
            <span key={f} onClick={() => setTab(i)} className={`chip grow cursor-pointer justify-center py-1.5 ${i === tab ? 'chip--accent' : ''}`}>
              {f}
            </span>
          ))}
        </div>

        {tab === 0 ? (
          <>
            <div className="row gap6 flex-wrap mt-3">
              {DIFFS.map((d, i) => (
                <span key={d.label} onClick={() => setDiff(i)} className={`chip cursor-pointer ${i === diff ? 'chip--accent' : ''}`}>
                  {d.label}
                </span>
              ))}
            </div>

            {tripsQ.isLoading ? (
              <div className="faint py-10 text-center text-sm">Buscando salidas…</div>
            ) : trips.length === 0 ? (
              <div className="faint py-10 text-center text-sm">No hay salidas públicas que coincidan.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-4 md:grid-cols-3 lg:grid-cols-4">
                {trips.map((t) => (
                  <div key={t.id} className="card cursor-pointer overflow-hidden" onClick={() => navigate(`/salida/${t.id}`)}>
                    <div
                      className="imgslot topo h-[96px] items-start bg-cover bg-center"
                      style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined}
                    >
                      <span className="chip mono m-2" style={{ fontSize: 9.5, padding: '2px 7px', background: 'color-mix(in srgb,var(--bg) 60%,transparent)' }}>
                        {t.elevationGain ?? 0} m+
                      </span>
                    </div>
                    <div className="px-2.5 pb-2.5 pt-2.5">
                      <div className="font-display text-[15px] leading-tight">{t.title}</div>
                      <div className="row gap6 mt-2">
                        <span className="faint text-xs">{tripDifficultyLabel(t.difficulty)}</span>
                        <span className="grow" />
                        <span className="faint mono text-[10.5px]">{t.distanceKm ?? 0} km</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-4">
            {tipsQ.isLoading ? (
              <div className="faint py-10 text-center text-sm">Cargando consejos…</div>
            ) : tips.length === 0 ? (
              <div className="faint py-10 text-center text-sm">Aún no hay consejos publicados.</div>
            ) : (
              <div className="lg:columns-2 lg:gap-4">
                {tips.map((t) => (
                  <article key={t.id} className="card mb-3 cursor-pointer overflow-hidden lg:break-inside-avoid" onClick={() => setReadSlug(t.slug)}>
                    <div className="imgslot topo h-[104px] items-start bg-cover bg-center" style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined}>
                      <span className="chip chip--terra m-2.5 capitalize">{t.category}</span>
                    </div>
                    <div className="px-3.5 pb-3.5 pt-3">
                      <h3 className="text-[17px] leading-tight">{t.title}</h3>
                      <div className="row gap8 faint mono mt-2 text-[11px]">
                        <Avatar name="YV" size={20} style={{ fontSize: 9 }} />
                        <span className="grow" />
                        <span className="row gap4"><Icon name="clock" size={11} /> {t.readMinutes}′</span>
                        <span className="row gap4"><Icon name="heart" size={11} /> {t.counts?.likes ?? 0}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <TipReadModal slug={readSlug} open={Boolean(readSlug)} onClose={() => setReadSlug(null)} />
    </AppShell>
  );
}
