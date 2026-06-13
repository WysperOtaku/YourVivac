import { Router } from 'express';
import {
  googleAuthSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@yourvivac/validation';
import { authGuard, validate, authRateLimit, notImplemented } from '../../middleware/index.js';

// NOTA(worker auth): sustituye `notImplemented(...)` por los controladores reales
// (auth.controller.ts) que llaman a auth.service.ts. No toques el barrel de rutas.
export const authRouter = Router();

authRouter.use(authRateLimit);

authRouter.post('/google', validate(googleAuthSchema), notImplemented('auth.google'));
authRouter.post('/register', validate(registerSchema), notImplemented('auth.register'));
authRouter.post('/login', validate(loginSchema), notImplemented('auth.login'));
authRouter.post('/refresh', notImplemented('auth.refresh'));
authRouter.post('/logout', notImplemented('auth.logout'));
authRouter.post('/verify-email', validate(verifyEmailSchema), notImplemented('auth.verifyEmail'));
authRouter.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  notImplemented('auth.forgotPassword'),
);
authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  notImplemented('auth.resetPassword'),
);
authRouter.get('/me', authGuard, notImplemented('auth.me'));
