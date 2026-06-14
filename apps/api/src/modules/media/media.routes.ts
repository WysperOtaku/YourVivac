import { Router } from 'express';
import multer from 'multer';
import { authGuard, asyncHandler, HttpError } from '../../middleware/index.js';
import { mediaService } from './media.service.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

export const mediaRouter = Router();
mediaRouter.post(
  '/upload',
  authGuard,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw HttpError.badRequest('Falta el archivo');
    res.status(201).json(await mediaService.upload(req.user!.userId, req.file));
  }),
);
