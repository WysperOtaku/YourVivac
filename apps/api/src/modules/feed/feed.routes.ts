import { Router } from 'express';
import { authGuard, asyncHandler } from '../../middleware/index.js';
import { feedService } from './feed.service.js';

export const feedRouter = Router();
feedRouter.get(
  '/',
  authGuard,
  asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    res.json(await feedService.home(req.user!.userId, page, pageSize));
  }),
);
