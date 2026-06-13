import { Router } from 'express';
import {
  createTripSchema,
  updateTripSchema,
  inviteSchema,
  rsvpSchema,
} from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (trips): implementa trips.service.ts (UC-T1/T2/T4) + controladores.
export const tripsRouter = Router();

tripsRouter.post('/', authGuard, validate(createTripSchema), notImplemented('trips.create'));
tripsRouter.get('/', authGuard, notImplemented('trips.list'));
tripsRouter.get('/:id', authGuard, notImplemented('trips.get'));
tripsRouter.patch('/:id', authGuard, validate(updateTripSchema), notImplemented('trips.update'));
tripsRouter.delete('/:id', authGuard, notImplemented('trips.remove'));
tripsRouter.post('/:id/invite', authGuard, validate(inviteSchema), notImplemented('trips.invite'));
tripsRouter.patch('/:id/rsvp', authGuard, validate(rsvpSchema), notImplemented('trips.rsvp'));
tripsRouter.post('/:id/complete', authGuard, notImplemented('trips.complete'));

// Rutas públicas de exploración (montadas en /explore por el barrel de rutas).
export const exploreRouter = Router();
exploreRouter.get('/trips', notImplemented('trips.explore'));
