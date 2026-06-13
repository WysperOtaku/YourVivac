import { Schema, model, type InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'trip_invite',
        'trip_join',
        'new_message',
        'pin_added',
        'tip_like',
        'comment',
        'follow',
        'guide_approved',
        'guide_rejected',
        'help_request',
        'mention',
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    target: { type: { type: String }, id: Schema.Types.ObjectId },
    data: Schema.Types.Mixed,
    read: { type: Boolean, default: false },
    readAt: Date,
    channels: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model('Notification', notificationSchema);
