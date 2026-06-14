import { Router } from 'express';
import { authGuard, asyncHandler } from '../../middleware/index.js';
import { notificationsService } from './notifications.service.js';

export const notificationsRouter = Router();
notificationsRouter.get(
  '/',
  authGuard,
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.list(req.user!.userId));
  }),
);
notificationsRouter.post(
  '/read-all',
  authGuard,
  asyncHandler(async (req, res) => {
    await notificationsService.readAll(req.user!.userId);
    res.status(204).end();
  }),
);
