import { Router } from 'express';
import { updateUserSchema, updateSettingsSchema } from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (users & social): implementa controladores + users.service.ts.
export const usersRouter = Router();

usersRouter.get('/:username', notImplemented('users.profile'));
usersRouter.patch('/me', authGuard, validate(updateUserSchema), notImplemented('users.updateMe'));
usersRouter.patch(
  '/me/settings',
  authGuard,
  validate(updateSettingsSchema),
  notImplemented('users.updateSettings'),
);
usersRouter.post('/me/avatar', authGuard, notImplemented('users.avatar'));
usersRouter.get('/:id/trips', notImplemented('users.trips'));
usersRouter.get('/:id/tips', notImplemented('users.tips'));
usersRouter.post('/:id/follow', authGuard, notImplemented('users.follow'));
usersRouter.delete('/:id/follow', authGuard, notImplemented('users.unfollow'));
