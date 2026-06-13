import { Router } from 'express';
import { authGuard, notImplemented } from '../../middleware/index.js';

// Worker (trips o un worker de feed): implementa feed.service.ts (UC-H1 feed de inicio).
export const feedRouter = Router();
feedRouter.get('/', authGuard, notImplemented('feed.home'));
