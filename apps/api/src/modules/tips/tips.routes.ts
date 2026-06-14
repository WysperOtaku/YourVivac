import { Router } from 'express';
import { createTipSchema, updateTipSchema, commentSchema } from '@yourvivac/validation';
import { authGuard, validate, asyncHandler } from '../../middleware/index.js';
import { tipsService } from './tips.service.js';

export const tipsRouter = Router();

tipsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    res.json(await tipsService.feed(req.query.category as string | undefined, page, pageSize));
  }),
);
tipsRouter.post(
  '/',
  authGuard,
  validate(createTipSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await tipsService.create(req.user!.userId, req.body));
  }),
);
tipsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    res.json(await tipsService.getBySlug(req.params.slug));
  }),
);
tipsRouter.patch(
  '/:id',
  authGuard,
  validate(updateTipSchema),
  asyncHandler(async (req, res) => {
    res.json(await tipsService.update(req.params.id, req.user!.userId, req.body));
  }),
);
tipsRouter.post(
  '/:id/like',
  authGuard,
  asyncHandler(async (req, res) => {
    await tipsService.like(req.params.id, req.user!.userId);
    res.status(204).end();
  }),
);
tipsRouter.post(
  '/:id/comments',
  authGuard,
  validate(commentSchema),
  asyncHandler(async (req, res) => {
    await tipsService.comment(req.params.id, req.user!.userId, req.body.body, req.body.parentId);
    res.status(201).end();
  }),
);
