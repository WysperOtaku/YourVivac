import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

const tipSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    cover: mediaRef,
    excerpt: String,
    category: {
      type: String,
      enum: ['material', 'seguridad', 'rutas', 'vivac', 'meteo'],
      required: true,
      index: true,
    },
    contentMarkdown: { type: String, required: true },
    readMinutes: { type: Number, default: 1 },
    tags: [String],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
    moderation: {
      status: { type: String, enum: ['ok', 'flagged', 'removed'], default: 'ok' },
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    counts: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    publishedAt: Date,
  },
  { timestamps: true },
);

export type TipDoc = InferSchemaType<typeof tipSchema>;
export const TipModel = model('Tip', tipSchema);
