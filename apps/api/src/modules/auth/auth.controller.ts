import type { CookieOptions, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.js';
import { env, isProd } from '../../config/env.js';
import { authService } from './auth.service.js';

const REFRESH_COOKIE = 'yv_refresh';
const cookieOpts: CookieOptions = {
  httpOnly: true,
  // En local sobre http: sameSite=lax + secure=false. En prod cross-site: none + secure.
  sameSite: env.COOKIE_SAMESITE ?? 'lax',
  secure: env.COOKIE_SECURE ?? isProd,
  path: '/api/v1/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, cookieOpts);
}

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
}

export const authController = {
  google: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken, created } = await authService.google(req.body.idToken);
    setRefreshCookie(res, refreshToken);
    res.status(created ? 201 : 200).json({ user, accessToken });
  }),

  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.refresh(readRefreshCookie(req));
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE, { ...cookieOpts, maxAge: undefined });
    res.status(204).end();
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.body.token);
    res.json({ ok: true });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.json({ ok: true });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ ok: true });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.user!.userId);
    res.json(user);
  }),
};
