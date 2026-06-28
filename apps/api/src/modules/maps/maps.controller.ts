import { env } from '../../config/env.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';
import { geocode, getTile, buildStyle, isTileLayer } from './maps.service.js';

/** Parsea un componente z/x/y a entero no negativo o lanza 400. */
function parseTileIndex(value: string, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw HttpError.badRequest(`Parámetro de tesela inválido: ${field}`, 'invalid_tile');
  }
  return n;
}

/** Calcula la base pública (proto + host) respetando proxies inversos. */
function publicBase(req: { protocol: string; get(name: string): string | undefined }): string {
  const host = req.get('host') ?? `localhost:${env.PORT}`;
  return `${req.protocol}://${host}`;
}

export const mapsController = {
  /** Proxy + caché de teselas raster del IGN. Público (lo pide MapLibre sin auth). */
  tile: asyncHandler(async (req, res) => {
    const { layer } = req.params;
    if (!isTileLayer(layer)) {
      throw HttpError.badRequest(`Capa no soportada: ${layer}`, 'invalid_layer');
    }
    const z = parseTileIndex(req.params.z, 'z');
    const x = parseTileIndex(req.params.x, 'x');
    const y = parseTileIndex(req.params.y, 'y');

    const { body, contentType } = await getTile(layer, z, x, y);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', `public, max-age=${env.TILE_CACHE_TTL}, immutable`);
    res.send(body);
  }),

  /** Devuelve un style MapLibre base cuyas sources apuntan a nuestro proxy. */
  style: asyncHandler(async (req, res) => {
    const style = buildStyle(req.params.name, publicBase(req));
    res.json(style);
  }),

  /** Geocoder de topónimos en España. Protegido por authGuard en las rutas. */
  search: asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '');
    res.json(await geocode(q));
  }),
};
