import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { fmtDateShort } from '@/lib/format';
import { useAuthStore } from '@/stores/authStore';

function Stat({ n, label, tone }: { n: string | number; label: string; tone?: string }) {
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

export function ProfileScreen() {
  const { username } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'salidas' | 'consejos'>('salidas');

  const isOwn = !username || username === me?.username;

  const profileQ = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.users.profile(username!),
    enabled: !isOwn && Boolean(username),
    retry: false,
  });

  // Usuario a mostrar: el propio (store) o el público consultado.
  const shown = isOwn ? me : profileQ.data?.user;
  const userId = shown?.id;
  const isGuide = shown?.role === 'guide';
  const isFollowing = profileQ.data?.isFollowing ?? false;

  const tripsQ = useQuery({
    queryKey: ['user-trips', userId],
    queryFn: () => api.users.trips(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
  const tipsQ = useQuery({
    queryKey: ['user-tips', userId],
    queryFn: () => api.users.tips(userId!),
    enabled: Boolean(userId),
    retry: false,
  });

  const followMut = useMutation({
    mutationFn: () => (isFollowing ? api.users.unfollow(userId!) : api.users.follow(userId!)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', username] }),
    onError: (e) => toast.error(errMsg(e, 'No se pudo completar')),
  });

  if (!shown) {
    return (
      <AppShell topbar={{ title: 'Perfil', sub: '' }}>
        <div className="faint p-10 text-center text-sm">{profileQ.isLoading ? 'Cargando perfil…' : 'Perfil no encontrado'}</div>
      </AppShell>
    );
  }

  const name = shown.displayName;
  const stats = (shown as { stats?: { trips: number; vivacs: number; distanceKm: number; elevationGain: number } }).stats;
  const bio = (shown as { bio?: string }).bio;
  const location = (shown as { location?: { name: string } }).location;
  const achievements = (shown as { achievements?: { key: string; label: string }[] }).achievements ?? [];
  const trips = tripsQ.data ?? [];
  const tips = tipsQ.data ?? [];

  return (
    <AppShell topbar={{ title: name, sub: 'Perfil' }}>
      <header className="spread flex-none px-[18px] pb-1 pt-1.5 lg:hidden">
        <button onClick={() => navigate(-1)} aria-label="Volver"><Icon name="back" size={26} /></button>
        <div className="row gap16">
          {isOwn && <button onClick={() => navigate('/ajustes')} aria-label="Ajustes"><Icon name="settings" size={22} /></button>}
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
                <Icon name="user" size={13} /> @{shown.username}
                {location?.name && (
                  <>
                    <span>·</span>
                    <Icon name="pin" size={13} /> {location.name}
                  </>
                )}
              </div>
            </div>
          </div>
          {bio && <p className="muted mt-3 text-[14.5px]">{bio}</p>}
          <div className="row gap8 mt-3">
            {isOwn ? (
              <button className="btn flex-1" onClick={() => navigate('/ajustes')}>
                <Icon name="settings" size={16} /> Editar perfil
              </button>
            ) : (
              <button
                className={`flex-1 btn ${isFollowing ? 'btn--ghost' : ''}`}
                onClick={() => followMut.mutate()}
                disabled={followMut.isPending}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className="card mt-[18px] px-2 py-4">
            <div className="row">
              <Stat n={stats.trips} label="Salidas" />
              <span className="self-stretch w-px bg-[var(--line)]" />
              <Stat n={stats.vivacs} label="Vivacs" tone="var(--accent)" />
              <span className="self-stretch w-px bg-[var(--line)]" />
              <Stat n={stats.distanceKm} label="km" />
              <span className="self-stretch w-px bg-[var(--line)]" />
              <Stat n={stats.elevationGain} label="Desnivel+" tone="var(--terra)" />
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="row gap10 overflow-x-auto pb-1 pt-4">
            {achievements.map((a) => (
              <div key={a.key} className="card stack gap8 min-w-[78px] flex-none items-center px-2.5 py-3">
                <div
                  className="grid h-[38px] w-[38px] place-items-center rounded-pin"
                  style={{ color: 'var(--terra)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb,var(--terra) 40%,transparent)' }}
                >
                  <Icon name="trophy" size={22} />
                </div>
                <span className="mono text-center text-[10px] text-ink-2">{a.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="row gap20 border-b border-[var(--line)] pt-4">
          {(['salidas', 'consejos'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2.5 text-[14.5px] capitalize ${tab === t ? 'border-b-2 border-accent text-ink' : 'faint'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'salidas' ? (
          <div className="grid grid-cols-2 gap-3 py-3.5 md:grid-cols-3 lg:grid-cols-4">
            {trips.length === 0 ? (
              <div className="faint col-span-full py-6 text-center text-sm">Sin salidas públicas.</div>
            ) : (
              trips.map((t) => (
                <div key={t.id} className="card cursor-pointer overflow-hidden" onClick={() => navigate(`/salida/${t.id}`)}>
                  <div
                    className="imgslot topo h-[84px] items-start bg-cover bg-center"
                    style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined}
                  >
                    <span className="chip mono m-2" style={{ fontSize: 9.5, padding: '2px 7px', background: 'color-mix(in srgb,var(--bg) 60%,transparent)' }}>
                      {fmtDateShort(t.startDate)}
                    </span>
                  </div>
                  <div className="px-2.5 pb-2.5 pt-2">
                    <div className="font-display text-[14.5px]">{t.title}</div>
                    <div className="faint mono row gap4 mt-1 text-[11px]">
                      <Icon name="elev" size={12} /> {t.elevationGain ?? 0} m+
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 py-3.5 sm:grid-cols-2">
            {tips.length === 0 ? (
              <div className="faint col-span-full py-6 text-center text-sm">Sin consejos publicados.</div>
            ) : (
              tips.map((t) => (
                <div key={t.id} className="card cursor-pointer overflow-hidden" onClick={() => navigate('/consejos')}>
                  <div className="px-3.5 py-3">
                    <div className="font-display text-[15px]">{t.title}</div>
                    <div className="faint mono mt-1 text-[11px]">{t.readMinutes}′ · {t.counts?.likes ?? 0} ♥</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
