import { Router } from 'express';
import multer from 'multer';
import { updateUserSchema, updateSettingsSchema } from '@yourvivac/validation';
import { authGuard, optionalAuth, validate } from '../../middleware/index.js';
import { usersController } from './users.controller.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export const usersRouter = Router();

usersRouter.patch('/me', authGuard, validate(updateUserSchema), usersController.updateMe);
usersRouter.patch('/me/settings', authGuard, validate(updateSettingsSchema), usersController.updateSettings);
usersRouter.post('/me/avatar', authGuard, upload.single('file'), usersController.avatar);
usersRouter.get('/search', authGuard, usersController.search);
usersRouter.get('/:id/trips', usersController.trips);
usersRouter.get('/:id/tips', usersController.tips);
usersRouter.post('/:id/follow', authGuard, usersController.follow);
usersRouter.delete('/:id/follow', authGuard, usersController.unfollow);
usersRouter.get('/:username', optionalAuth, usersController.profile);
