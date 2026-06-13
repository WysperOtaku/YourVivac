import { Schema, model, type InferSchemaType } from 'mongoose';

// follows — relación seguidor → seguido (idempotente vía índice único compuesto).
const followSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// reactions — likes polimórficos (tip, trip, pin).
const reactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['tip', 'trip', 'pin'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);
reactionSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// comments — anidables vía parentId.
const commentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['tip', 'trip'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    body: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true },
);

export type FollowDoc = InferSchemaType<typeof followSchema>;
export type ReactionDoc = InferSchemaType<typeof reactionSchema>;
export type CommentDoc = InferSchemaType<typeof commentSchema>;
export const FollowModel = model('Follow', followSchema);
export const ReactionModel = model('Reaction', reactionSchema);
export const CommentModel = model('Comment', commentSchema);
