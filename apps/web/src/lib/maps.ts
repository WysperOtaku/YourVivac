/** API key de Google Maps (Maps JavaScript API + Places API). */
export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

/** True si hay clave configurada → habilita mapas y autocompletado de lugares. */
export const isMapsConfigured = Boolean(MAPS_API_KEY);

export interface LatLng {
  lat: number;
  lng: number;
}

/** Centro por defecto (Pirineos) cuando aún no hay coordenadas. */
export const DEFAULT_CENTER: LatLng = { lat: 42.63, lng: 0.65 };

/**
 * El mapa topográfico IGN (pin `topo`/`route`) NO requiere clave: se sirve y
 * cachea por nuestra API y se pinta con MapLibre + estilo YourVivac. Siempre
 * disponible (a diferencia del pin `map` de Google, que depende de la clave).
 */
export const isTopoConfigured = true;
