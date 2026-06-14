import { Worker, type Processor } from 'bullmq';
import { getRedis } from '../db/redis.js';
import { logger } from '../config/logger.js';
import { QUEUE_NAMES, type QueueName } from './queues.js';
import { MediaModel, DailyMetricsModel } from '../models/ops.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { UserModel } from '../models/user.model.js';
import { TripModel } from '../models/trip.model.js';
import { TipModel } from '../models/tip.model.js';
import { sendMail } from '../lib/mailer.js';

/**
 * Processors por cola. Servicio aparte en Railway (`node dist/workers.js` o tsx).
 */
const processors: Record<QueueName, Processor> = {
  [QUEUE_NAMES.imageModeration]: async (job) => {
    const { mediaId } = job.data as { mediaId: string };
    // Stub de moderación: en producción llamar a Cloudinary AI / Google Vision / Rekognition.
    // Por defecto aprobamos; un proveedor real marcaría 'rejected' + labels.
    await MediaModel.updateOne(
      { _id: mediaId },
      { $set: { 'moderation.status': 'approved', 'moderation.provider': 'stub' } },
    );
  },

  [QUEUE_NAMES.email]: async (job) => {
    const { to, subject, html, text } = job.data as { to: string; subject: string; html: string; text?: string };
    await sendMail({ to, subject, html, text });
  },

  [QUEUE_NAMES.notifications]: async (job) => {
    // Fan-out: crea la notificación in-app respetando settings del usuario.
    const data = job.data as {
      userId: string;
      type: string;
      actorId?: string;
      target?: { type: string; id: string };
    };
    const user = await UserModel.findById(data.userId).select('settings.notifications');
    const channels = {
      push: Boolean(user?.settings?.notifications?.push),
      email: Boolean(user?.settings?.notifications?.email),
    };
    await NotificationModel.create({ ...data, channels });
  },

  [QUEUE_NAMES.feed]: async (job) => {
    // Generación de actividades ya se hace inline en los servicios; aquí quedaría
    // el fan-out a seguidores si se materializan timelines.
    logger.debug({ job: job.id }, 'feed job procesado');
  },

  [QUEUE_NAMES.analytics]: async () => {
    // Snapshot diario agregado para el panel admin.
    const today = new Date().toISOString().slice(0, 10);
    const [newUsers, tripsCreated, tipsPublished, guidesVerified] = await Promise.all([
      UserModel.countDocuments({ createdAt: { $gte: new Date(`${today}T00:00:00Z`) } }),
      TripModel.countDocuments({ createdAt: { $gte: new Date(`${today}T00:00:00Z`) } }),
      TipModel.countDocuments({ status: 'published', publishedAt: { $gte: new Date(`${today}T00:00:00Z`) } }),
      UserModel.countDocuments({ role: 'guide', 'guide.verifiedAt': { $gte: new Date(`${today}T00:00:00Z`) } }),
    ]);
    await DailyMetricsModel.updateOne(
      { date: today },
      { $set: { newUsers, tripsCreated, tipsPublished, guidesVerified } },
      { upsert: true },
    );
  },
};

export function startWorkers(): Worker[] {
  const connection = getRedis();
  const workers = (Object.keys(processors) as QueueName[]).map(
    (name) => new Worker(name, processors[name], { connection }),
  );
  logger.info(`🛠️  ${workers.length} workers iniciados`);
  return workers;
}

// Entrypoint del servicio de workers (tanto en dev `.ts` como en build `.js`).
if (process.argv[1] && /workers[\\/]index\.(ts|js)$/.test(process.argv[1])) {
  startWorkers();
}
