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
