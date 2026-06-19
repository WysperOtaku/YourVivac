import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Rsvp } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { fmtDateShort, tripDifficultyLabel, tripStatusLabel } from '@/lib/format';
import { useAuthStore } from '@/stores/authStore';

function Stat({ n, label, tone }: { n: string | number; label: string; tone?: string }) {
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

const RSVP_OPTS: { key: Rsvp; label: string }[] = [
  { key: 'going', label: 'Voy' },
  { key: 'maybe', label: 'Quizá' },
  { key: 'declined', label: 'No puedo' },
];

export function TripDetailScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [invite, setInvite] = useState('');

  const { data: trip, isLoading } = useQuery({ queryKey: ['trip', id], queryFn: () => api.trips.get(id), retry: false });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['trip', id] });
    qc.invalidateQueries({ queryKey: ['trips'] });
  };

  const inviteMut = useMutation({
    mutationFn: () => api.trips.invite(id, { users: invite.split(',').map((s) => s.trim()).filter(Boolean) }),
    onSuccess: () => {
      setInvite('');
      invalidate();
      toast.success('Invitaciones enviadas');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo invitar')),
  });
  const rsvpMut = useMutation({
    mutationFn: (rsvp: Rsvp) => api.trips.rsvp(id, { rsvp }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errMsg(e, 'No se pudo actualizar tu asistencia')),
  });
  const completeMut = useMutation({
    mutationFn: () => api.trips.complete(id),
    onSuccess: () => {
      invalidate();
      toast.success('Salida completada 🎉');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo completar')),
  });

  if (isLoading) {
    return (
      <AppShell topbar={{ title: 'Salida', sub: '' }} bareDesktop>
        <div className="faint p-10 text-center text-sm">Cargando salida…</div>
      </AppShell>
    );
  }
  if (!trip) {
    return (
      <AppShell topbar={{ title: 'Salida', sub: '' }} bareDesktop>
        <div className="p-10 text-center">
          <p className="muted">No se encontró la salida.</p>
          <button className="btn mt-3" onClick={() => navigate('/salidas')}>Volver a salidas</button>
        </div>
      </AppShell>
    );
  }

  const isOwner = me?.id === String(trip.owner);
  const myRsvp = trip.members.find((m) => String(m.userId) === me?.id)?.rsvp;
  const days = Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86_400_000));
  const going = trip.members.filter((m) => m.rsvp === 'going').length;
  const members = trip.memberUsers ?? [];

  return (
    <AppShell
      topbar={{ title: trip.title, sub: `${fmtDateShort(trip.startDate)}–${fmtDateShort(trip.endDate)} · ${trip.location?.name ?? ''}` }}
      bareDesktop
    >
      <div className="mx-auto w-full max-w-3xl px-[18px] pb-6 lg:px-7 lg:pt-4">
        <header className="row gap12 flex-none pb-2 pt-2 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver">
            <Icon name="back" size={26} />
          </button>
          <div className="grow">
            <h3 className="text-[19px]">{trip.title}</h3>
            <div className="faint mono text-[11px]">
              {fmtDateShort(trip.startDate)}–{fmtDateShort(trip.endDate)} · {trip.location?.name}
            </div>
          </div>
        </header>

        <div
          className="imgslot topo relative h-[180px] items-end rounded-card bg-cover bg-center"
          style={trip.cover?.url ? { backgroundImage: `url(${trip.cover.url})` } : undefined}
        >
          <span className={`chip m-3 ${trip.status === 'completed' ? 'chip--terra' : 'chip--accent'}`}>
            {tripStatusLabel(trip.status)}
          </span>
        </div>

        <div className="row gap8 flex-wrap mt-4">
          <span className="chip">
            <Icon name="calendar" size={13} /> {fmtDateShort(trip.startDate)}–{fmtDateShort(trip.endDate)}
          </span>
          <span className="chip">
            <Icon name="pin" size={13} /> {trip.location?.name}
          </span>
          <span className="chip chip--terra">{tripDifficultyLabel(trip.difficulty)}</span>
        </div>

        {trip.description && <p className="muted mt-3 text-[15px]">{trip.description}</p>}

        <div className="card mt-4 px-2 py-4">
          <div className="row">
            <Stat n={trip.elevationGain ?? 0} label="Desnivel+" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n={trip.distanceKm ?? 0} label="km" tone="var(--accent)" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n={days} label="días" />
            <span className="self-stretch w-px bg-[var(--line)]" />
            <Stat n={going} label="van" tone="var(--terra)" />
          </div>
        </div>

        {/* Tu asistencia */}
        <div className="spread mt-5">
          <span className="eyebrow">Tu asistencia</span>
        </div>
        <div className="row gap8 mt-2">
          {RSVP_OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => rsvpMut.mutate(o.key)}
              disabled={rsvpMut.isPending}
              className={`chip cursor-pointer ${myRsvp === o.key ? 'chip--accent' : ''}`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Montañeros */}
        <div className="spread mt-5">
          <span className="eyebrow">Montañeros · {members.length}</span>
        </div>
        <div className="row gap10 mt-2.5 flex-wrap">
          {members.map((m) => (
            <div key={m.id} className="row gap8 rounded-pill bg-bg-2 py-1.5 pl-1.5 pr-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
              <Avatar name={m.displayName} size={26} />
              <span className="text-[13px]">{m.displayName}</span>
            </div>
          ))}
        </div>
        <div className="row gap8 mt-3">
          <input
            className="grow rounded-control bg-bg-2 px-3.5 py-2.5 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
            placeholder="Invitar por usuario o @handle…"
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
          />
          <button className="btn px-4" onClick={() => inviteMut.mutate()} disabled={!invite.trim() || inviteMut.isPending}>
            Invitar
          </button>
        </div>

        <div className="row gap10 mt-6">
          <button className="btn grow" onClick={() => navigate(`/salida/${id}/tablero`)}>
            <Icon name="layers" size={18} /> Abrir tablero
          </button>
          <button className="btn btn--ghost grow" onClick={() => navigate(`/salida/${id}/chat`)}>
            <Icon name="chat" size={18} /> Chat del grupo
          </button>
        </div>

        {isOwner && trip.status !== 'completed' && (
          <button className="btn btn--ghost btn--block mt-3" onClick={() => completeMut.mutate()} disabled={completeMut.isPending}>
            <Icon name="check" size={18} /> Marcar como completada
          </button>
        )}
      </div>
    </AppShell>
  );
}
