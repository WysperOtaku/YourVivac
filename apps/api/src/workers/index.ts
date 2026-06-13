import { Worker } from 'bullmq';
import { getRedis } from '../db/redis.js';
import { logger } from '../config/logger.js';
import { QUEUE_NAMES } from './queues.js';

/**
 * Proceso de workers (servicio aparte en Railway). Cada cola tiene su processor.
 * Worker (realtime & workers): implementa la lógica de cada processor:
 *   - image-moderation: analiza media subida y actualiza media.moderation.
 *   - email: envía transaccionales (lib/mailer).
 *   - notifications: fan-out in-app + push/email según settings.
 *   - feed: genera activities al completar salidas o publicar consejos.
 *   - analytics: cron que agrega dailyMetrics.
 */
export function startWorkers(): Worker[] {
  const connection = getRedis();
  const workers = Object.values(QUEUE_NAMES).map(
    (name) =>
      new Worker(
        name,
        async (job) => {
          logger.info({ queue: name, jobId: job.id }, 'job recibido (processor no implementado)');
          // TODO(worker): implementa el processor de esta cola.
        },
        { connection },
      ),
  );
  logger.info(`🛠️  ${workers.length} workers iniciados`);
  return workers;
}

// Permite ejecutar este archivo como entrypoint del servicio de workers.
if (process.argv[1] && process.argv[1].endsWith('workers/index.ts')) {
  startWorkers();
}
