import { Router } from 'express';
import multer from 'multer';
import { authGuard, notImplemented } from '../../middleware/index.js';

// Worker (notifications & media): implementa media.service.ts (UC-M1).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

export const mediaRouter = Router();
mediaRouter.post('/upload', authGuard, upload.single('file'), notImplemented('media.upload'));
