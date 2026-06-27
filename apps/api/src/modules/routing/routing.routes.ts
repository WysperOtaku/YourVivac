import { Router } from 'express';
import { routeRequestSchema } from '@yourvivac/validation';
import { authGuard, notImplemented, validate } from '../../middleware/index.js';

/**
 * Motor de rutas de senderismo (BRouter self-host). Esqueleto de fundación: el
 * worker «routing» rellena la lógica (proxy a BROUTER_URL → RouteResult).
 */
export const routingRouter = Router();
routingRouter.post(
  '/',
  authGuard,
  validate(routeRequestSchema),
  notImplemented('routing: BRouter'),
);
