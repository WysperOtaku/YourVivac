import { Router } from 'express';
import { guideApplySchema } from '@yourvivac/validation';
import { authGuard, validate, asyncHandler } from '../../middleware/index.js';
import { guideService } from './guide.service.js';

export const guideRouter = Router();

guideRouter.post(
  '/apply',
  authGuard,
  validate(guideApplySchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await guideService.apply(req.user!.userId, req.body));
  }),
);
guideRouter.get(
  '/application',
  authGuard,
  asyncHandler(async (req, res) => {
    res.json(await guideService.myApplication(req.user!.userId));
  }),
);
