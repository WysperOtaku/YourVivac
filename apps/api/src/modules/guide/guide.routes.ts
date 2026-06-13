import { Router } from 'express';
import { guideApplySchema } from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (guide): implementa guide.service.ts (UC-U2 solicitar guía).
export const guideRouter = Router();

guideRouter.post('/apply', authGuard, validate(guideApplySchema), notImplemented('guide.apply'));
guideRouter.get('/application', authGuard, notImplemented('guide.application'));
