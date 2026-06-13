import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

const guideApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    certification: { type: String, required: true },
    certBody: { type: String, required: true },
    documents: [mediaRef],
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    notes: String,
  },
  { timestamps: true },
);

export type GuideApplicationDoc = InferSchemaType<typeof guideApplicationSchema>;
export const GuideApplicationModel = model('GuideApplication', guideApplicationSchema);
