import { Router } from 'express';
import { sendMessageSchema } from '@yourvivac/validation';
import { authGuard, validate, asyncHandler } from '../../middleware/index.js';
import { chatService } from './chat.service.js';

// chatRouter se monta bajo /trips; messagesRouter bajo /messages (ver routes/index.ts).
export const chatRouter = Router();
chatRouter.get(
  '/:id/messages',
  authGuard,
  asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 30;
    res.json(await chatService.history(req.params.id, req.user!.userId, page, pageSize));
  }),
);
chatRouter.post(
  '/:id/messages',
  authGuard,
  validate(sendMessageSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await chatService.send(req.params.id, req.user!.userId, req.body));
  }),
);

export const messagesRouter = Router();
messagesRouter.delete(
  '/:id',
  authGuard,
  asyncHandler(async (req, res) => {
    await chatService.remove(req.params.id, req.user!.userId);
    res.status(204).end();
  }),
);
