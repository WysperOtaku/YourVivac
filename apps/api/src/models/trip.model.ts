import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

const tripSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    cover: mediaRef,
    description: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [
      new Schema(
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          role: { type: String, enum: ['owner', 'member'], default: 'member' },
          rsvp: {
            type: String,
            enum: ['invited', 'going', 'maybe', 'declined'],
            default: 'invited',
          },
          joinedAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: {
      name: String,
      coords: { lat: Number, lng: Number },
      placeId: String,
    },
    difficulty: { type: String, enum: ['facil', 'moderada', 'dificil', 'alpina'], default: 'moderada' },
    distanceKm: { type: Number, default: 0 },
    elevationGain: { type: Number, default: 0 },
    visibility: { type: String, enum: ['private', 'public'], default: 'private', index: true },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning',
    },
    gpx: mediaRef,
    stats: {
      pinCount: { type: Number, default: 0 },
      photoCount: { type: Number, default: 0 },
      kudos: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
    },
    completedAt: Date,
  },
  { timestamps: true },
);

tripSchema.index({ 'location.coords': '2dsphere' });
tripSchema.index({ 'members.userId': 1 });

export type TripDoc = InferSchemaType<typeof tripSchema>;
export const TripModel = model('Trip', tripSchema);
