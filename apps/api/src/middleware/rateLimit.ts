import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../db/redis.js';
import { isTest } from '../config/env.js';

function store() {
  if (isTest) return undefined; // en test usa el store en memoria por defecto
  const redis = getRedis();
  return new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
  });
}

/** Límite global de peticiones. */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
});

/** Límite estricto para /auth/* (anti fuerza bruta). */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
});
