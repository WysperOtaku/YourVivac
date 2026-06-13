import { Router } from 'express';
import { createTipSchema, updateTipSchema, commentSchema } from '@yourvivac/validation';
import { authGuard, validate, optionalAuth, notImplemented } from '../../middleware/index.js';

// Worker (tips): implementa tips.service.ts (UC-P1/P2).
export const tipsRouter = Router();

tipsRouter.get('/', notImplemented('tips.feed'));
tipsRouter.post('/', authGuard, validate(createTipSchema), notImplemented('tips.create'));
tipsRouter.get('/:slug', optionalAuth, notImplemented('tips.get'));
tipsRouter.patch('/:id', authGuard, validate(updateTipSchema), notImplemented('tips.update'));
tipsRouter.post('/:id/like', authGuard, notImplemented('tips.like'));
tipsRouter.post('/:id/comments', authGuard, validate(commentSchema), notImplemented('tips.comment'));
