import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

/** Error de dominio con código HTTP. Lánzalo desde servicios/controladores. */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(msg = 'Solicitud inválida', code?: string) {
    return new HttpError(400, msg, code);
  }
  static unauthorized(msg = 'No autenticado') {
    return new HttpError(401, msg, 'unauthorized');
  }
  static forbidden(msg = 'Sin permiso') {
    return new HttpError(403, msg, 'forbidden');
  }
  static notFound(msg = 'No encontrado') {
    return new HttpError(404, msg, 'not_found');
  }
  static conflict(msg = 'Conflicto') {
    return new HttpError(409, msg, 'conflict');
  }
  static unprocessable(msg = 'No procesable', details?: unknown) {
    return new HttpError(422, msg, 'unprocessable', details);
  }
}

/** Envuelve un handler async para propagar errores al errorHandler. */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Handler 404 para rutas no registradas. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ statusCode: 404, message: 'Ruta no encontrada', code: 'not_found' });
}

/** Respuesta 501 para endpoints aún no implementados (esqueleto). */
export function notImplemented(feature: string): RequestHandler {
  return (_req, res) => {
    res
      .status(501)
      .json({ statusCode: 501, message: `No implementado: ${feature}`, code: 'not_implemented' });
  };
}

/** Middleware de error final: formatea todo a la forma ApiError. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      statusCode: 422,
      message: 'Validación fallida',
      code: 'validation_error',
      details: err.flatten(),
    });
    return;
  }
  if (err instanceof HttpError) {
    res
      .status(err.statusCode)
      .json({ statusCode: err.statusCode, message: err.message, code: err.code, details: err.details });
    return;
  }
  logger.error({ err }, 'Error no controlado');
  res.status(500).json({ statusCode: 500, message: 'Error interno del servidor', code: 'internal' });
}
