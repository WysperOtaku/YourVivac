import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../db/redis.js';
import { isTest } from '../config/env.js';

// OJO: cada limitador necesita su PROPIO prefijo de clave; si comparten prefijo,
// se incrementan la misma clave (colisión + ERR_ERL_DOUBLE_COUNT) y se bloquean
// entre sí. La clave es por IP del cliente (req.ip), que con `trust proxy` +
// X-Forwarded-For (el proxy web lo reenvía) es la IP real de cada cliente.
function store(prefix: string) {
  if (isTest) return undefined; // en test usa el store en memoria por defecto
  const redis = getRedis();
  return new RedisStore({
    prefix,
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
  });
}

/** Límite global de peticiones (por cliente). */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('rl:global:'),
});

/** Límite para /auth/* (anti fuerza bruta), por cliente. */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: store('rl:auth:'),
});
