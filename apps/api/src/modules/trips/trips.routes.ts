import { Router } from 'express';
import {
  createTripSchema,
  updateTripSchema,
  inviteSchema,
  rsvpSchema,
} from '@yourvivac/validation';
import { authGuard, validate } from '../../middleware/index.js';
import { tripsController } from './trips.controller.js';

export const tripsRouter = Router();

tripsRouter.post('/', authGuard, validate(createTripSchema), tripsController.create);
tripsRouter.get('/', authGuard, tripsController.list);
tripsRouter.get('/:id', authGuard, tripsController.get);
tripsRouter.patch('/:id', authGuard, validate(updateTripSchema), tripsController.update);
tripsRouter.delete('/:id', authGuard, tripsController.remove);
tripsRouter.post('/:id/invite', authGuard, validate(inviteSchema), tripsController.invite);
tripsRouter.patch('/:id/rsvp', authGuard, validate(rsvpSchema), tripsController.rsvp);
tripsRouter.post('/:id/complete', authGuard, tripsController.complete);

// Rutas públicas de exploración (montadas en /explore por el barrel de rutas).
export const exploreRouter = Router();
exploreRouter.get('/trips', tripsController.explore);
