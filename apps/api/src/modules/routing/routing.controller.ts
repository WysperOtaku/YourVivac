import { asyncHandler } from '../../middleware/error.js';
import { routingService } from './routing.service.js';

/** Controlador de rutas. El cuerpo ya viene validado por `routeRequestSchema`. */
export const routingController = {
  route: asyncHandler(async (req, res) => {
    res.json(await routingService.route(req.body));
  }),
};
