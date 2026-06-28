import axios from 'axios';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/error.js';
import type { GeoCoords, RouteProfile, RouteRequest, RouteResult } from '@yourvivac/types';

/**
 * Motor de rutas de senderismo: proxy hacia un BRouter self-host (servicio
 * `brouter` de docker-compose, perfil `routing`). Construimos la query, pedimos
 * el GeoJSON y lo normalizamos a `RouteResult` (geometría lat/lng + distancia +
 * desnivel ±). La API nunca calcula rutas: delega en BRouter.
 */

/** Mapea el perfil de la petición a un perfil BRouter (.brf disponible en el contenedor). */
const PROFILE_MAP: Record<RouteProfile, string> = {
  hiking: 'yv-hiking',
  mountain: 'yv-hiking',
  trekking: 'trekking',
};

/** Forma (parcial) de la respuesta GeoJSON de BRouter que nos interesa. */
interface BrouterFeature {
  geometry?: { coordinates?: number[][] };
  properties?: Record<string, string | undefined>;
}
interface BrouterGeoJson {
  features?: BrouterFeature[];
}

/** Convierte un valor de `properties` (BRouter los devuelve como string) a número seguro. */
function num(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Calcula el descenso acumulado (m) sumando las bajadas de altitud entre puntos
 * consecutivos. BRouter no expone un «filtered descend», así que lo derivamos de
 * la coordenada Z (coords[2]) de la geometría.
 */
function computeDescent(coordinates: number[][]): number {
  let descent = 0;
  for (let i = 1; i < coordinates.length; i += 1) {
    const prev = coordinates[i - 1][2];
    const cur = coordinates[i][2];
    if (Number.isFinite(prev) && Number.isFinite(cur) && cur < prev) {
      descent += prev - cur;
    }
  }
  return Math.round(descent);
}

export const routingService = {
  /** Calcula una ruta a través de BRouter y la devuelve normalizada. */
  async route(req: RouteRequest): Promise<RouteResult> {
    const profile = PROFILE_MAP[req.profile] ?? PROFILE_MAP.hiking;

    // OJO: BRouter espera lng,lat (longitud primero), al revés que {lat,lng}.
    const lonlats = req.waypoints.map((wp) => `${wp.lng},${wp.lat}`).join('|');

    let data: BrouterGeoJson | string;
    try {
      const res = await axios.get<BrouterGeoJson | string>(`${env.BROUTER_URL}/brouter`, {
        params: { lonlats, profile, alternativeidx: 0, format: 'geojson' },
        timeout: 15_000,
      });
      data = res.data;
    } catch {
      // El servicio no responde / red caída → 502 (Bad Gateway).
      throw new HttpError(502, 'El servicio de rutas (BRouter) no está disponible', 'routing_unavailable');
    }

    // Ante un error de cálculo BRouter responde 200 con texto plano (no GeoJSON).
    if (typeof data === 'string' || !data || typeof data !== 'object') {
      throw new HttpError(
        422,
        'No se pudo calcular la ruta con los puntos indicados',
        'route_not_found',
        typeof data === 'string' ? data.trim() : undefined,
      );
    }

    const feature = data.features?.[0];
    const coordinates = feature?.geometry?.coordinates;
    if (!coordinates || coordinates.length < 2) {
      throw new HttpError(422, 'No se encontró una ruta entre los puntos indicados', 'route_not_found');
    }

    const props = feature?.properties ?? {};
    const geometry: GeoCoords[] = coordinates.map(([lng, lat]) => ({ lat, lng }));

    const result: RouteResult = {
      profile: req.profile,
      waypoints: req.waypoints,
      geometry,
      distanceM: Math.round(num(props['track-length'])),
      ascentM: Math.round(num(props['filtered ascend'])),
      descentM: computeDescent(coordinates),
      durationMin: Math.round(num(props['total-time']) / 60),
    };
    return result;
  },
};
