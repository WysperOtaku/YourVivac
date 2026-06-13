import { Router } from 'express';
import { authGuard, notImplemented } from '../../middleware/index.js';

// Worker (notifications & media): implementa notifications.service.ts + media.
export const notificationsRouter = Router();
notificationsRouter.get('/', authGuard, notImplemented('notifications.list'));
notificationsRouter.post('/read-all', authGuard, notImplemented('notifications.readAll'));
