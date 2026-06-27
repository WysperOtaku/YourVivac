import { Router } from 'express';
import { authGuard, notImplemented } from '../../middleware/index.js';

/**
 * Mapa topográfico IGN (España). Esqueleto de fundación: el worker «tile-proxy»
 * rellena la lógica (caché vía StorageAdapter + fetch a IGN + style YourVivac).
 * Teselas y style son públicos (los pide MapLibre sin cabeceras de auth).
 */
export const mapsRouter = Router();
mapsRouter.get('/tiles/:layer/:z/:x/:y', notImplemented('maps: teselas IGN'));
mapsRouter.get('/style/:name', notImplemented('maps: style YourVivac'));
mapsRouter.get('/search', authGuard, notImplemented('maps: geocoder'));
