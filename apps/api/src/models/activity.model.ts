import { Schema, model, type InferSchemaType } from 'mongoose';

const activitySchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['trip_completed', 'tip_published', 'achievement'],
      required: true,
    },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    tipId: { type: Schema.Types.ObjectId, ref: 'Tip' },
    visibility: { type: String, enum: ['private', 'public'], default: 'public' },
  },
  { timestamps: true },
);

activitySchema.index({ actorId: 1, createdAt: -1 });

export type ActivityDoc = InferSchemaType<typeof activitySchema>;
export const ActivityModel = model('Activity', activitySchema);
