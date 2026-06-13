import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

const messageSchema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: ['text', 'pin_share', 'system'], default: 'text' },
    body: String,
    pinRef: { type: Schema.Types.ObjectId, ref: 'Pin' },
    attachments: [mediaRef],
    readBy: [
      new Schema(
        { userId: { type: Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } },
        { _id: false },
      ),
    ],
    editedAt: Date,
    deletedAt: Date,
  },
  { timestamps: true },
);

messageSchema.index({ tripId: 1, createdAt: -1 });

export type MessageDoc = InferSchemaType<typeof messageSchema>;
export const MessageModel = model('Message', messageSchema);
