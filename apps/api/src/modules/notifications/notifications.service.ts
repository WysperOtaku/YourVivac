import type { Notification } from '@yourvivac/types';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDocs } from '../../lib/serialize.js';

export const notificationsService = {
  async list(userId: string): Promise<{ items: Notification[]; unread: number }> {
    const [docs, unread] = await Promise.all([
      NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50),
      NotificationModel.countDocuments({ userId, read: false }),
    ]);
    return { items: serializeDocs<Notification>(docs), unread };
  },

  async readAll(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } },
    );
  },
};
