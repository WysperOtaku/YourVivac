import type { RequestHandler } from 'express';
import type { UserRole } from '@yourvivac/types';
import { verifyAccessToken } from '../lib/jwt.js';
import { HttpError } from './error.js';

/** Verifica el access JWT del header Authorization y puebla `req.user`. */
export const authGuard: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(HttpError.unauthorized('Falta el token de acceso'));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    next(HttpError.unauthorized('Token de acceso inválido o expirado'));
  }
};

/** Autoriza por rol. Úsalo después de `authGuard`. */
export function roleGuard(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(HttpError.unauthorized());
    if (!roles.includes(req.user.role)) return next(HttpError.forbidden('Rol insuficiente'));
    next();
  };
}

/** Variante opcional: puebla `req.user` si hay token válido, pero no falla si no lo hay. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice('Bearer '.length));
      req.user = { userId: payload.userId, role: payload.role };
    } catch {
      /* ignora token inválido en rutas opcionales */
    }
  }
  next();
};
