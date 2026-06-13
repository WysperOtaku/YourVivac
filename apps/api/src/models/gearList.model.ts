import { Schema, model, type InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    storeKey: {
      type: String,
      enum: ['amazon', 'decathlon', 'deporvillage', 'barrabes', 'forum', 'coleman'],
    },
    title: String,
    url: String,
    price: Number,
    currency: String,
    image: String,
    externalId: String,
  },
  { _id: false },
);

const gearListSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: String,
    icon: String,
    items: [
      new Schema({
        name: { type: String, required: true },
        weightGrams: Number,
        checked: { type: Boolean, default: false },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        product: productSchema,
      }),
    ],
    totalWeight: { type: Number, default: 0 },
    isTemplate: { type: Boolean, default: false },
    usedInTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }],
    visibility: { type: String, enum: ['private', 'trip', 'public'], default: 'private' },
  },
  { timestamps: true },
);

export type GearListDoc = InferSchemaType<typeof gearListSchema>;
export const GearListModel = model('GearList', gearListSchema);
