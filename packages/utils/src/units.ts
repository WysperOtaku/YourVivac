// Conversión y formato de unidades (sistema métrico/imperial).

const KM_TO_MI = 0.621371;
const M_TO_FT = 3.28084;

export type UnitSystem = 'metric' | 'imperial';

export function kmToMiles(km: number): number {
  return km * KM_TO_MI;
}

export function metersToFeet(m: number): number {
  return m * M_TO_FT;
}

/** Formatea una distancia en km según el sistema de unidades. */
export function formatDistance(km: number, system: UnitSystem = 'metric'): string {
  if (system === 'imperial') return `${kmToMiles(km).toFixed(1)} mi`;
  return `${km.toFixed(km % 1 === 0 ? 0 : 1)} km`;
}

/** Formatea un desnivel en metros según el sistema de unidades. */
export function formatElevation(meters: number, system: UnitSystem = 'metric'): string {
  if (system === 'imperial') return `${Math.round(metersToFeet(meters))} ft`;
  return `${Math.round(meters)} m`;
}

/** Formatea unas coordenadas como texto monoespaciado (4 decimales). */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
