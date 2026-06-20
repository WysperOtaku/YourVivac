import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { fmtDateShort } from '@/lib/format';

export function SearchScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const enabled = q.trim().length >= 2;

  const usersQ = useQuery({ queryKey: ['search-users', q], queryFn: () => api.users.search(q), enabled, retry: false });
  const tripsQ = useQuery({ queryKey: ['search-trips', q], queryFn: () => api.trips.explore({ q }), enabled, retry: false });
  const tipsQ = useQuery({ queryKey: ['search-tips', q], queryFn: () => api.tips.feed(), enabled, retry: false });

  const users = usersQ.data ?? [];
  const trips = tripsQ.data?.items ?? [];
  const tips = (tipsQ.data?.items ?? []).filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
  const empty = enabled && users.length === 0 && trips.length === 0 && tips.length === 0 && !usersQ.isLoading && !tripsQ.isLoading;

  return (
    <AppShell topbar={{ title: 'Buscar', sub: 'Explora' }} mobileFullscreen>
      <div className="mx-auto w-full max-w-3xl px-[18px] pb-10 pt-2 lg:px-7 lg:pt-4">
        <div className="row gap10 flex-none pb-3 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver"><Icon name="back" size={26} /></button>
          <h1 className="text-[22px]">Buscar</h1>
        </div>

        <div className="row gap10 rounded-control bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
          <Icon name="search" size={18} className="text-ink-3" />
          <input
            autoFocus
            className="grow bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
            placeholder="Buscar usuarios, salidas, consejos…"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          />
        </div>

        {!enabled ? (
          <div className="faint py-12 text-center text-sm">Escribe al menos 2 caracteres.</div>
        ) : empty ? (
          <div className="faint py-12 text-center text-sm">Sin resultados para “{q}”.</div>
        ) : (
          <div className="stack gap24 pt-5">
            {users.length > 0 && (
              <section>
                <div className="eyebrow mb-2">Gente</div>
                <div className="card px-3.5 py-0.5">
                  {users.map((u, i) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(`/u/${u.username}`)}
                      className={`row gap12 w-full py-2.5 text-left ${i < users.length - 1 ? 'border-b border-[var(--line)]' : ''}`}
                    >
                      <Avatar name={u.displayName} size={36} src={u.avatar?.url} className="overflow-hidden" />
                      <div className="grow min-w-0">
                        <div className="row gap6 text-[15px]">
                          {u.displayName}
                          {u.role === 'guide' && <Icon name="shield" size={13} className="text-terra" />}
                        </div>
                        <div className="faint mono text-[11px]">@{u.username}</div>
                      </div>
                      <Icon name="chevron" size={16} className="text-ink-3" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {trips.length > 0 && (
              <section>
                <div className="eyebrow mb-2">Salidas</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {trips.map((t) => (
                    <div key={t.id} className="card cursor-pointer overflow-hidden" onClick={() => navigate(`/salida/${t.id}`)}>
                      <div className="imgslot topo h-[80px] items-start bg-cover bg-center" style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined} />
                      <div className="px-2.5 pb-2.5 pt-2">
                        <div className="font-display text-[14px]">{t.title}</div>
                        <div className="faint mono mt-1 text-[10.5px]">{fmtDateShort(t.startDate)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tips.length > 0 && (
              <section>
                <div className="eyebrow mb-2">Consejos</div>
                <div className="stack gap8">
                  {tips.map((t) => (
                    <div key={t.id} className="card cursor-pointer p-3.5" onClick={() => navigate('/consejos')}>
                      <div className="font-display text-[15px]">{t.title}</div>
                      <div className="faint mono mt-1 text-[11px] capitalize">{t.category} · {t.readMinutes}′</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
