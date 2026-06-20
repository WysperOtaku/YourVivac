import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Trip, TripDifficulty, TripVisibility, UpdateTripRequest } from '@yourvivac/types';
import { Field, Icon, Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { isMapsConfigured } from '@/lib/maps';
import { LocationSearch } from '@/components/maps/LocationSearch';
import { DateTimePicker } from '@/components/DateTimePicker';

const DIFFS: { key: TripDifficulty; label: string }[] = [
  { key: 'facil', label: 'Fácil' },
  { key: 'moderada', label: 'Moderada' },
  { key: 'dificil', label: 'Difícil' },
  { key: 'alpina', label: 'Alpina' },
];

export function EditTripModal({ open, onClose, trip }: { open: boolean; onClose: () => void; trip: Trip }) {
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

  // Rellena desde la salida al abrir.
  useEffect(() => {
    if (!open) return;
    setTitle(trip.title);
    setStart(trip.startDate);
    setEnd(trip.endDate);
    setPlace(trip.location?.name ?? '');
    setLat(String(trip.location?.coords?.lat ?? 42.63));
    setLng(String(trip.location?.coords?.lng ?? 0.65));
    setDifficulty(trip.difficulty);
    setVisibility(trip.visibility);
    setDistanceKm(trip.distanceKm != null ? String(trip.distanceKm) : '');
    setElevationGain(trip.elevationGain != null ? String(trip.elevationGain) : '');
  }, [open, trip]);

  const saveMut = useMutation({
    mutationFn: () => {
      const payload: UpdateTripRequest = {
        title: title.trim(),
        startDate: start ? new Date(start).toISOString() : trip.startDate,
        endDate: end ? new Date(end).toISOString() : trip.endDate,
        location: { name: place.trim(), coords: { lat: Number(lat), lng: Number(lng) } },
        difficulty,
        visibility,
        distanceKm: distanceKm ? Number(distanceKm) : 0,
        elevationGain: elevationGain ? Number(elevationGain) : 0,
      };
      return api.trips.update(trip.id, payload);
    },
    onSuccess: (updated) => {
      qc.setQueryData(['trip', trip.id], updated);
      qc.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Salida actualizada');
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo guardar la salida')),
  });

  const inputCls =
    'w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]';

  return (
    <Modal open={open} onClose={onClose} title="Editar salida">
      <form
        className="stack gap14"
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate();
        }}
      >
        <Field label="Nombre de la salida" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vivac en el Aneto" />

        <div className="row gap12 items-start">
          <label className="stack gap6 grow">
            <span className="eyebrow">Salida</span>
            <DateTimePicker value={start} onChange={setStart} placeholder="Día y hora" />
          </label>
          <label className="stack gap6 grow">
            <span className="eyebrow">Regreso</span>
            <DateTimePicker value={end} onChange={setEnd} placeholder="Día y hora" />
          </label>
        </div>

        <label className="stack gap6">
          <span className="eyebrow">Lugar / punto de inicio</span>
          {isMapsConfigured ? (
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
          ) : (
            <input className={inputCls} placeholder="Refugio de la Renclusa…" value={place} onChange={(e) => setPlace(e.target.value)} />
          )}
        </label>

        <label className="stack gap6">
          <span className="eyebrow">Dificultad</span>
          <div className="row gap8 flex-wrap">
            {DIFFS.map((d) => (
              <span key={d.key} onClick={() => setDifficulty(d.key)} className={`chip cursor-pointer ${d.key === difficulty ? 'chip--accent' : ''}`}>
                {d.label}
              </span>
            ))}
          </div>
        </label>

        <div className="row gap12">
          <label className="stack gap6 grow">
            <span className="eyebrow">Distancia (km)</span>
            <input className={`${inputCls} mono`} inputMode="decimal" placeholder="22" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} />
          </label>
          <label className="stack gap6 grow">
            <span className="eyebrow">Desnivel+ (m)</span>
            <input className={`${inputCls} mono`} inputMode="decimal" placeholder="1180" value={elevationGain} onChange={(e) => setElevationGain(e.target.value)} />
          </label>
        </div>

        <label className="stack gap6">
          <span className="eyebrow">Visibilidad</span>
          <div className="row gap8">
            {(['private', 'public'] as TripVisibility[]).map((v) => (
              <span key={v} onClick={() => setVisibility(v)} className={`chip cursor-pointer ${v === visibility ? 'chip--accent' : ''}`}>
                {v === 'private' ? 'Privada' : 'Pública'}
              </span>
            ))}
          </div>
        </label>

        <button className="btn btn--block btn--lg" type="submit" disabled={saveMut.isPending}>
          {saveMut.isPending ? 'Guardando…' : 'Guardar cambios'} <Icon name="check" size={18} />
        </button>
      </form>
    </Modal>
  );
}
