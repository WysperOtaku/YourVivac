import type { Message, Paginated, SendMessageRequest } from '@yourvivac/types';
import { MessageModel } from '../../models/message.model.js';
import { TripModel } from '../../models/trip.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { emitToTrip } from '../../realtime/index.js';
import { HttpError } from '../../middleware/error.js';

async function assertMember(tripId: string, userId: string) {
  const trip = await TripModel.findById(tripId).select('members');
  if (!trip) throw HttpError.notFound('Salida no encontrada');
  if (!trip.members.some((m) => String(m.userId) === userId)) {
    throw HttpError.forbidden('No eres miembro de esta salida');
  }
  return trip;
}

export const chatService = {
  async history(tripId: string, userId: string, page = 1, pageSize = 30): Promise<Paginated<Message>> {
    await assertMember(tripId, userId);
    const filter = { tripId, deletedAt: null };
    const [docs, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      MessageModel.countDocuments(filter),
    ]);
    return {
      items: serializeDocs<Message>(docs.reverse()),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  },

  async send(tripId: string, userId: string, input: SendMessageRequest): Promise<Message> {
    const trip = await assertMember(tripId, userId);
    const message = await MessageModel.create({
      tripId,
      authorId: userId,
      type: input.type ?? 'text',
      body: input.body,
      pinRef: input.pinRef,
      attachments: input.attachments,
      readBy: [{ userId, at: new Date() }],
    });
    const serialized = serializeDoc<Message>(message);
    emitToTrip(tripId, 'message:new', serialized);

    // Notifica al resto de miembros.
    const others = trip.members.map((m) => m.userId).filter((id) => String(id) !== userId);
    await NotificationModel.insertMany(
      others.map((uid) => ({
        userId: uid,
        type: 'new_message',
        actorId: userId,
        target: { type: 'trip', id: tripId },
      })),
    );
    return serialized;
  },

  async remove(messageId: string, userId: string): Promise<void> {
    const message = await MessageModel.findById(messageId);
    if (!message) throw HttpError.notFound('Mensaje no encontrado');
    if (String(message.authorId) !== userId) throw HttpError.forbidden('Solo el autor puede borrar');
    message.deletedAt = new Date();
    await message.save();
    emitToTrip(String(message.tripId), 'message:deleted', { id: messageId });
  },
};
