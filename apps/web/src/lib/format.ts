import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Trip, TripDifficulty, TripStatus } from '@yourvivac/types';
import type { Member } from '@/components/cards';

/** "14 JUN" a partir de una fecha ISO. */
export function fmtDateShort(iso?: string): string {
  if (!iso) return '';
  return new Date(iso)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    .toUpperCase()
    .replace('.', '');
}

/** Tiempo relativo en español ("hace 2 días"). */
export function relativeTime(iso?: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
  } catch {
    return '';
  }
}

const STATUS_LABELS: Record<TripStatus, string> = {
  planning: 'Planeando',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};
export const tripStatusLabel = (s: TripStatus): string => STATUS_LABELS[s] ?? s;

const DIFFICULTY_LABELS: Record<TripDifficulty, string> = {
  facil: 'Fácil',
  moderada: 'Moderada',
  dificil: 'Difícil',
  alpina: 'Alpina',
};
export const tripDifficultyLabel = (d: TripDifficulty): string => DIFFICULTY_LABELS[d] ?? d;

/** Miembros para las tarjetas (usa identidades pobladas por el API). */
export function tripMembers(trip: Trip): Member[] {
  return (trip.memberUsers ?? []).map((u) => ({ n: u.displayName }));
}

/** Mapea una salida del API a las props de <TripCard>. */
export function tripToCard(trip: Trip) {
  return {
    name: trip.title,
    place: trip.location?.name ?? '',
    date: fmtDateShort(trip.startDate),
    m: String(trip.elevationGain ?? 0),
    dist: String(trip.distanceKm ?? 0),
    status: tripStatusLabel(trip.status),
    members: tripMembers(trip),
  };
}
