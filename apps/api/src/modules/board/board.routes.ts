import { Router } from 'express';
import { createPinSchema, updatePinSchema, reactionSchema } from '@yourvivac/validation';
import { authGuard, validate } from '../../middleware/index.js';
import { boardController } from './board.controller.js';

// boardRouter se monta bajo /trips; pinsRouter bajo /pins (ver routes/index.ts).
export const boardRouter = Router();
boardRouter.get('/:id/board', authGuard, boardController.board);
boardRouter.post('/:id/pins', authGuard, validate(createPinSchema), boardController.createPin);

export const pinsRouter = Router();
pinsRouter.patch('/:id', authGuard, validate(updatePinSchema), boardController.updatePin);
pinsRouter.delete('/:id', authGuard, boardController.deletePin);
pinsRouter.post('/:id/reactions', authGuard, validate(reactionSchema), boardController.react);
