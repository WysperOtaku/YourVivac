import { Router } from 'express';
import { geocodeQuerySchema } from '@yourvivac/validation';
import { authGuard, validate } from '../../middleware/index.js';
import { mapsController } from './maps.controller.js';

/**
 * Mapa topográfico IGN (España): proxy + caché de teselas (vía StorageAdapter),
 * style MapLibre base y geocoder de topónimos.
 *
 * Teselas y style son PÚBLICOS: los pide MapLibre sin cabeceras de auth. La
 * búsqueda de topónimos sí va protegida por `authGuard`.
 */
export const mapsRouter = Router();
mapsRouter.get('/tiles/:layer/:z/:x/:y', mapsController.tile);
mapsRouter.get('/style/:name', mapsController.style);
mapsRouter.get('/search', authGuard, validate(geocodeQuerySchema, 'query'), mapsController.search);
