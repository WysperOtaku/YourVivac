import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTripSchema } from '@yourvivac/validation';
import type { CreateTripRequest, TripDifficulty, TripVisibility } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { isMapsConfigured } from '@/lib/maps';
import { LocationSearch } from '@/components/maps/LocationSearch';

const DIFFS: { key: TripDifficulty; label: string }[] = [
  { key: 'facil', label: 'Fácil' },
  { key: 'moderada', label: 'Moderada' },
  { key: 'dificil', label: 'Difícil' },
  { key: 'alpina', label: 'Alpina' },
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
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [place, setPlace] = useState('');
  const [lat, setLat] = useState('42.63');
  const [lng, setLng] = useState('0.65');
  const [difficulty, setDifficulty] = useState<TripDifficulty>('moderada');
  const [visibility, setVisibility] = useState<TripVisibility>('private');
  const [distanceKm, setDistanceKm] = useState('');
  const [elevationGain, setElevationGain] = useState('');
  const [invites, setInvites] = useState('');

  const createMut = useMutation({
    mutationFn: async () => {
      const payload: CreateTripRequest = {
        title: title.trim(),
        startDate: start ? new Date(start).toISOString() : '',
        endDate: end ? new Date(end).toISOString() : '',
        location: { name: place.trim(), coords: { lat: Number(lat), lng: Number(lng) } },
        difficulty,
        visibility,
        ...(distanceKm ? { distanceKm: Number(distanceKm) } : {}),
        ...(elevationGain ? { elevationGain: Number(elevationGain) } : {}),
      };
      const parsed = createTripSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Revisa los campos');
      }
      const trip = await api.trips.create(payload);
      const handles = invites.split(',').map((s) => s.trim()).filter(Boolean);
      if (handles.length > 0) {
        await api.trips.invite(trip.id, { users: handles }).catch(() => undefined);
      }
      return trip;
    },
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Salida creada');
      navigate(`/salida/${trip.id}/tablero`, { replace: true });
    },
    onError: (err) => toast.error(errMsg(err, 'No se pudo crear la salida')),
  });

  return (
    <AppShell topbar={{ title: 'Nueva salida', sub: 'Detalles' }} bareDesktop>
      <header className="row gap12 flex-none px-[18px] pb-2.5 pt-2 lg:px-7 lg:pt-5">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="lg:hidden">
          <Icon name="back" size={26} />
        </button>
        <div className="grow">
          <h3 className="text-[19px] lg:text-[25px]">Nueva salida</h3>
          <div className="eyebrow mt-0.5">Detalles de la salida</div>
        </div>
        <span className="faint mono cursor-pointer text-[13px]" onClick={() => navigate('/')}>
          Cancelar
        </span>
      </header>

      <form
        className="mx-auto w-full max-w-2xl px-[18px] pb-28 lg:px-7"
        onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate();
        }}
      >
        <Field label="Nombre de la salida">
          <input className={inputCls} placeholder="Vivac en el Aneto" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div className="row gap12">
          <div className="grow">
            <Field label="Salida">
              <input type="datetime-local" className={`${inputCls} mono`} value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
          </div>
          <div className="grow">
            <Field label="Regreso">
              <input type="datetime-local" className={`${inputCls} mono`} value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="Lugar / punto de inicio">
          {isMapsConfigured ? (
            <>
              <LocationSearch
                className={inputCls}
                defaultValue={place}
                placeholder="Refugio de la Renclusa, Benasque"
                onPick={(p) => {
                  setPlace(p.name);
                  setLat(String(p.coords.lat));
                  setLng(String(p.coords.lng));
                }}
              />
              {place && <span className="faint mono mt-1 block text-[11px]">{place} · {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</span>}
            </>
          ) : (
            <input className={inputCls} placeholder="Refugio de la Renclusa, Benasque" value={place} onChange={(e) => setPlace(e.target.value)} />
          )}
        </Field>
        {!isMapsConfigured && (
          <div className="row gap12">
            <div className="grow">
              <Field label="Latitud">
                <input className={`${inputCls} mono`} value={lat} onChange={(e) => setLat(e.target.value)} />
              </Field>
            </div>
            <div className="grow">
              <Field label="Longitud">
                <input className={`${inputCls} mono`} value={lng} onChange={(e) => setLng(e.target.value)} />
              </Field>
            </div>
          </div>
        )}
        <Field label="Dificultad">
          <div className="row gap8 flex-wrap">
            {DIFFS.map((d) => (
              <span
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`chip cursor-pointer ${d.key === difficulty ? 'chip--accent' : ''}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </Field>
        <div className="row gap12">
          <div className="grow">
            <Field label="Distancia (km)">
              <input className={`${inputCls} mono`} inputMode="decimal" placeholder="22" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
            </Field>
          </div>
          <div className="grow">
            <Field label="Desnivel+ (m)">
              <input className={`${inputCls} mono`} inputMode="decimal" placeholder="1180" value={elevationGain} onChange={(e) => setElevationGain(e.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="Visibilidad">
          <div className="row gap8">
            {(['private', 'public'] as TripVisibility[]).map((v) => (
              <span
                key={v}
                onClick={() => setVisibility(v)}
                className={`chip cursor-pointer ${v === visibility ? 'chip--accent' : ''}`}
              >
                {v === 'private' ? 'Privada' : 'Pública'}
              </span>
            ))}
          </div>
        </Field>
        <Field label="Invitar (usuarios o @handles, separados por comas)">
          <input className={inputCls} placeholder="lucia, iker, ana" value={invites} onChange={(e) => setInvites(e.target.value)} />
        </Field>

        <div className="fixed inset-x-0 bottom-[68px] flex-none bg-bg-2 px-[18px] py-3 shadow-[inset_0_1px_0_var(--line)] lg:bottom-0 lg:left-60">
          <div className="mx-auto max-w-2xl">
            <button className="btn btn--block btn--lg" type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? 'Creando…' : 'Crear salida'} <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
