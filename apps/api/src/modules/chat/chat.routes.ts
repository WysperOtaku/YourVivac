import { Router } from 'express';
import { sendMessageSchema } from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (chat): implementa chat.service.ts. chatRouter se monta bajo /trips;
// messagesRouter bajo /messages (ver routes/index.ts).
export const chatRouter = Router();
chatRouter.get('/:id/messages', authGuard, notImplemented('chat.history'));
chatRouter.post(
  '/:id/messages',
  authGuard,
  validate(sendMessageSchema),
  notImplemented('chat.send'),
);

export const messagesRouter = Router();
messagesRouter.delete('/:id', authGuard, notImplemented('chat.remove'));
