import { Router } from 'express';
import { createPinSchema, updatePinSchema, reactionSchema } from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (board & pins): implementa board.service.ts (UC-B1/B2) + emisión por socket.
// boardRouter se monta bajo /trips; pinsRouter bajo /pins (ver routes/index.ts).
export const boardRouter = Router();
boardRouter.get('/:id/board', authGuard, notImplemented('board.get'));
boardRouter.post('/:id/pins', authGuard, validate(createPinSchema), notImplemented('board.createPin'));

export const pinsRouter = Router();
pinsRouter.patch('/:id', authGuard, validate(updatePinSchema), notImplemented('board.updatePin'));
pinsRouter.delete('/:id', authGuard, notImplemented('board.deletePin'));
pinsRouter.post('/:id/reactions', authGuard, validate(reactionSchema), notImplemented('board.react'));
