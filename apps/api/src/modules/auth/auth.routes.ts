import { Router } from 'express';
import {
  googleAuthSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@yourvivac/validation';
import { authGuard, validate, authRateLimit } from '../../middleware/index.js';
import { authController } from './auth.controller.js';

export const authRouter = Router();

authRouter.use(authRateLimit);

authRouter.post('/google', validate(googleAuthSchema), authController.google);
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
authRouter.get('/me', authGuard, authController.me);
