import axios from 'axios';
import type { GeocodeResult } from '@yourvivac/types';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { HttpError } from '../../middleware/error.js';
import { storage, type StoredBlob } from '../../lib/storage/index.js';

/**
 * Servicio del mapa topográfico IGN (España): proxy + caché de teselas (vía
 * StorageAdapter), construcción de un style MapLibre base y geocoder de topónimos.
 *
 * Teselas RASTER del IGN (WMTS, sistema GoogleMapsCompatible = EPSG:3857, z/x/y
 * estándar). Servicios públicos y gratuitos (atribución «© IGN España»).
 */

/** Capas soportadas por el proxy de teselas.
 *  Raster IGN (mtn/relieve/ortofoto/base) + DEM de elevación (dem, Terrarium) +
 *  base vectorial del IGN (btn, MVT). El `dem` alimenta el sombreado y las curvas
 *  de nivel que genera el cliente; `btn` es la base vectorial reestilable. */
export type TileLayer = 'mtn' | 'relieve' | 'ortofoto' | 'base' | 'dem' | 'btn';

interface LayerConfig {
  /** wmts = KVP GetTile del IGN; xyz = plantilla directa {z}/{x}/{y}. */
  kind?: 'wmts' | 'xyz';
  /** Base del servicio (host + ruta). */
  base: string;
  /** Identificador de capa WMTS (solo kind=wmts). */
  layer?: string;
  /** Content-Type esperado / Accept. */
  format: string;
  /** Extensión de fichero para la clave de caché. */
  ext: string;
  /** Plantilla relativa para kind=xyz (admite {z}/{x}/{y} en cualquier orden). */
  template?: string;
}

/**
 * Mapa de capa lógica → servicio WMTS del IGN. Identificadores confirmados con
 * los GetCapabilities de cada servicio:
 *  - mtn:      www.ign.es/wmts/mapa-raster  · capa «MTN»                 (jpeg)
 *  - base:     www.ign.es/wmts/ign-base     · capa «IGNBaseTodo»         (jpeg)
 *  - ortofoto: www.ign.es/wmts/pnoa-ma      · capa «OI.OrthoimageCoverage» (jpeg)
 *  - relieve:  servicios.idee.es/wmts/mdt   · capa «Relieve» (sombreado MDT)
 *
 * El relieve NO se sirve desde www.ign.es/wmts, por eso su base se fija aquí en
 * vez de derivarse de `IGN_WMTS_BASE`.
 *
 * TODO(MVT): el IGN publica teselas vectoriales (MVT) para el mapa base. Mientras
 * no se confirme el endpoint/tilejson estable, «base» se sirve como raster
 * IGNBaseTodo. Migrar a una source `vector` cuando el MVT esté verificado.
 */
const LAYERS: Record<TileLayer, LayerConfig> = {
  mtn: { base: `${env.IGN_WMTS_BASE}/mapa-raster`, layer: 'MTN', format: 'image/jpeg', ext: 'jpg' },
  base: { base: `${env.IGN_WMTS_BASE}/ign-base`, layer: 'IGNBaseTodo', format: 'image/jpeg', ext: 'jpg' },
  ortofoto: {
    base: `${env.IGN_WMTS_BASE}/pnoa-ma`,
    layer: 'OI.OrthoimageCoverage',
    format: 'image/jpeg',
    ext: 'jpg',
  },
  relieve: {
    base: 'https://servicios.idee.es/wmts/mdt',
    layer: 'Relieve',
    format: 'image/jpeg',
    ext: 'jpg',
  },
  // DEM de elevación (Terrarium de AWS, gratis y global). Lo consume maplibre-contour
  // en el cliente para el sombreado de relieve y las curvas de nivel.
  dem: {
    kind: 'xyz',
    base: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium',
    template: '/{z}/{x}/{y}.png',
    format: 'image/png',
    ext: 'png',
  },
  // Base vectorial del IGN (Base Topográfica Nacional, MVT). OJO: orden {z}/{y}/{x}.
  btn: {
    kind: 'xyz',
    base: 'https://vt-btn.idee.es/1.0.0/btn/tile',
    template: '/{z}/{y}/{x}.pbf',
    format: 'application/x-protobuf',
    ext: 'pbf',
  },
};

export const TILE_LAYERS = Object.keys(LAYERS) as TileLayer[];

/** True si `value` es una capa soportada. */
export function isTileLayer(value: string): value is TileLayer {
  return Object.prototype.hasOwnProperty.call(LAYERS, value);
}

/** Construye la URL upstream de una tesela z/x/y (WMTS KVP del IGN o XYZ directa). */
function buildTileUrl(cfg: LayerConfig, z: number, x: number, y: number): string {
  if (cfg.kind === 'xyz' && cfg.template) {
    const path = cfg.template
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y));
    return `${cfg.base}${path}`;
  }
  const params = new URLSearchParams({
    service: 'WMTS',
    request: 'GetTile',
    version: '1.0.0',
    layer: cfg.layer ?? '',
    style: 'default',
    format: cfg.format,
    tilematrixset: 'GoogleMapsCompatible',
    TileMatrix: String(z),
    TileRow: String(y),
    TileCol: String(x),
  });
  return `${cfg.base}?${params.toString()}`;
}

/**
 * Devuelve una tesela: si está en caché (StorageAdapter) la sirve; si no, la pide
 * al IGN, la guarda y la devuelve. La clave es `${layer}/${z}/${x}/${y}.${ext}`.
 */
export async function getTile(
  layer: TileLayer,
  z: number,
  x: number,
  y: number,
): Promise<StoredBlob> {
  const cfg = LAYERS[layer];
  const key = `${layer}/${z}/${x}/${y}.${cfg.ext}`;

  const cached = await storage.get(key);
  if (cached) return cached;

  const url = buildTileUrl(cfg, z, x, y);
  let body: Buffer;
  let contentType: string;
  try {
    const res = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 15_000,
      headers: { 'User-Agent': 'YourVivacBot/0.1', Accept: cfg.format },
    });
    body = Buffer.from(res.data);
    contentType = (res.headers['content-type'] as string | undefined) ?? cfg.format;
  } catch (err) {
    logger.warn({ err, layer, z, x, y }, 'maps: fallo al obtener tesela del IGN');
    throw new HttpError(502, 'No se pudo obtener la tesela del IGN', 'tile_upstream_error');
  }

  if (body.length === 0) {
    throw new HttpError(502, 'Tesela vacía del IGN', 'tile_upstream_error');
  }

  // Cachea sin bloquear la respuesta (los errores de escritura no deben romper el proxy).
  await storage.put(key, body, contentType).catch((err) => {
    logger.warn({ err, key }, 'maps: fallo al cachear tesela');
  });

  return { body, contentType };
}

/** Devuelve la base pública (proto+host) desde la que servimos el proxy de teselas. */
function tileTemplate(publicBase: string, layer: TileLayer): string {
  return `${publicBase}/api/v1/maps/tiles/${layer}/{z}/{x}/{y}`;
}

/**
 * Mapa nombre de style → capa raster a mostrar. La estética fina YourVivac la
 * aporta el frontend; aquí entregamos un style MapLibre base, simple y válido.
 */
const STYLE_LAYER: Record<string, TileLayer> = {
  'yv-topo': 'mtn',
  'yv-relieve': 'relieve',
  'yv-ortofoto': 'ortofoto',
  'yv-base': 'base',
  mtn: 'mtn',
  relieve: 'relieve',
  ortofoto: 'ortofoto',
  base: 'base',
};

/** Construye un style MapLibre (raster) cuyas sources apuntan a NUESTRO proxy. */
export function buildStyle(name: string, publicBase: string): object {
  const layer = STYLE_LAYER[name] ?? 'mtn';
  return {
    version: 8,
    name,
    sources: {
      [layer]: {
        type: 'raster',
        tiles: [tileTemplate(publicBase, layer)],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: '© Instituto Geográfico Nacional de España (IGN)',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#e8e4d8' } },
      { id: layer, type: 'raster', source: layer },
    ],
  };
}

// --- Geocoder de topónimos (España) ---

interface CartoCiudadCandidate {
  address?: string;
  lat?: number;
  lng?: number;
  muni?: string;
  province?: string;
}

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
}

/** Geocoder primario: CartoCiudad (IGN). Devuelve sólo candidatos con coords válidas. */
async function geocodeCartoCiudad(q: string): Promise<GeocodeResult[]> {
  const url = `${env.IGN_GEOCODER_URL}/candidates`;
  const res = await axios.get<CartoCiudadCandidate[]>(url, {
    params: { q, limit: 10 },
    timeout: 10_000,
    headers: { 'User-Agent': 'YourVivacBot/0.1', Accept: 'application/json' },
  });
  const data = Array.isArray(res.data) ? res.data : [];
  return data
    .filter(
      (c) =>
        typeof c.lat === 'number' &&
        typeof c.lng === 'number' &&
        (c.lat !== 0 || c.lng !== 0),
    )
    .map((c) => {
      const context = [c.muni, c.province].filter(Boolean).join(', ');
      return {
        name: c.address ?? q,
        coords: { lat: c.lat as number, lng: c.lng as number },
        ...(context ? { context } : {}),
      };
    });
}

/** Geocoder de respaldo: Nominatim (OSM), limitado a España. */
async function geocodeNominatim(q: string): Promise<GeocodeResult[]> {
  const res = await axios.get<NominatimResult[]>(
    'https://nominatim.openstreetmap.org/search',
    {
      params: { q, countrycodes: 'es', format: 'json', limit: 10 },
      timeout: 10_000,
      headers: { 'User-Agent': 'YourVivacBot/0.1', Accept: 'application/json' },
    },
  );
  const data = Array.isArray(res.data) ? res.data : [];
  return data
    .filter((r) => r.lat != null && r.lon != null && r.display_name)
    .map((r) => {
      const parts = (r.display_name as string).split(',').map((s) => s.trim());
      const name = parts[0] ?? (r.display_name as string);
      const context = parts.slice(1).join(', ');
      return {
        name,
        coords: { lat: Number(r.lat), lng: Number(r.lon) },
        ...(context ? { context } : {}),
      };
    });
}

/**
 * Busca topónimos en España. Intenta CartoCiudad y, si no devuelve resultados
 * con coordenadas válidas (o falla), recurre a Nominatim.
 */
export async function geocode(q: string): Promise<GeocodeResult[]> {
  try {
    const primary = await geocodeCartoCiudad(q);
    if (primary.length > 0) return primary;
  } catch (err) {
    logger.warn({ err, q }, 'maps: CartoCiudad falló; usando Nominatim');
  }

  try {
    return await geocodeNominatim(q);
  } catch (err) {
    logger.warn({ err, q }, 'maps: geocoder de respaldo falló');
    throw new HttpError(502, 'El servicio de geocodificación no está disponible', 'geocoder_error');
  }
}

export const mapsService = { getTile, buildStyle, geocode, isTileLayer };
