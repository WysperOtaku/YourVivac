import { Schema, model, type InferSchemaType } from 'mongoose';

// reports — moderación.
const reportSchema = new Schema(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true },
);

// sessions — refresh tokens persistidos y rotables.
const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    device: String,
    ip: String,
    userAgent: String,
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  { timestamps: true },
);

// media — imágenes subidas + estado de moderación.
const mediaSchema = new Schema(
  {
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    bytes: Number,
    moderation: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      labels: [String],
      provider: String,
    },
  },
  { timestamps: true },
);

// dailyMetrics — snapshot diario para el panel admin.
const dailyMetricsSchema = new Schema({
  date: { type: String, required: true, unique: true },
  newUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  tripsCreated: { type: Number, default: 0 },
  tipsPublished: { type: Number, default: 0 },
  guidesVerified: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
});

export type ReportDoc = InferSchemaType<typeof reportSchema>;
export type SessionDoc = InferSchemaType<typeof sessionSchema>;
export type MediaDoc = InferSchemaType<typeof mediaSchema>;
export type DailyMetricsDoc = InferSchemaType<typeof dailyMetricsSchema>;
export const ReportModel = model('Report', reportSchema);
export const SessionModel = model('Session', sessionSchema);
export const MediaModel = model('Media', mediaSchema);
export const DailyMetricsModel = model('DailyMetrics', dailyMetricsSchema);
