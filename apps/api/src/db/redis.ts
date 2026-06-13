import { Redis } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let client: Redis | null = null;

/** Conexión Redis compartida (cache, rate limit, colas BullMQ). Lazy singleton. */
export function getRedis(): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    client.on('error', (err) => logger.error({ err }, 'Redis error'));
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
