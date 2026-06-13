import { Queue } from 'bullmq';
import { getRedis } from '../db/redis.js';

export const QUEUE_NAMES = {
  imageModeration: 'image-moderation',
  email: 'email',
  notifications: 'notifications',
  feed: 'feed',
  analytics: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

/** Devuelve (o crea) una cola BullMQ compartida sobre la conexión Redis. */
export function getQueue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, { connection: getRedis() });
    queues.set(name, q);
  }
  return q;
}
