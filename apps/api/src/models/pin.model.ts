import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

// Pin discriminado por `type`: cada subdoc opcional se valida en la capa Zod.
const pinSchema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['note', 'photo', 'link', 'list', 'map', 'text'], required: true },
    layout: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      rotation: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
      w: { type: Number, default: 200 },
    },
    note: new Schema({ markdown: String }, { _id: false }),
    text: new Schema({ body: String, color: String }, { _id: false }),
    photo: new Schema({ media: mediaRef, caption: String }, { _id: false }),
    link: new Schema(
      { url: String, title: String, description: String, image: String, domain: String },
      { _id: false },
    ),
    map: new Schema(
      {
        label: String,
        coords: { lat: Number, lng: Number },
        placeId: String,
        address: String,
        elevation: Number,
        path: [{ _id: false, lat: Number, lng: Number }],
      },
      { _id: false },
    ),
    list: new Schema({ gearListId: { type: Schema.Types.ObjectId, ref: 'GearList' } }, { _id: false }),
    reactions: [
      new Schema(
        { userId: { type: Schema.Types.ObjectId, ref: 'User' }, emoji: String },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

export type PinDoc = InferSchemaType<typeof pinSchema>;
export const PinModel = model('Pin', pinSchema);
