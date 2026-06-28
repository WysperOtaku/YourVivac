import { Router } from 'express';
import { routeRequestSchema } from '@yourvivac/validation';
import { authGuard, validate } from '../../middleware/index.js';
import { routingController } from './routing.controller.js';

/**
 * Motor de rutas de senderismo (BRouter self-host). Proxy a `BROUTER_URL` que
 * normaliza el GeoJSON de BRouter a `RouteResult` (geometría + desnivel ±).
 * Montado en `/routing` por la fundación (routes/index.ts).
 */
export const routingRouter = Router();
routingRouter.post('/', authGuard, validate(routeRequestSchema), routingController.route);
