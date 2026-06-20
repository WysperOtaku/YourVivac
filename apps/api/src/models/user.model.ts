import { Schema, model, type InferSchemaType } from 'mongoose';

const mediaRef = new Schema(
  { url: String, publicId: String, width: Number, height: Number },
  { _id: false },
);

const userSchema = new Schema(
  {
    displayName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    passwordHash: { type: String, select: false },
    authProviders: [
      new Schema(
        {
          provider: { type: String, enum: ['password', 'google'], required: true },
          providerId: String,
          linkedAt: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
    ],
    avatar: mediaRef,
    bio: String,
    location: new Schema(
      { name: String, coords: { lat: Number, lng: Number } },
      { _id: false },
    ),
    role: { type: String, enum: ['user', 'guide', 'admin'], default: 'user', index: true },
    guide: new Schema(
      {
        status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected'] },
        certification: String,
        certBody: String,
        verifiedAt: Date,
        verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
      { _id: false },
    ),
    stats: {
      trips: { type: Number, default: 0 },
      vivacs: { type: Number, default: 0 },
      distanceKm: { type: Number, default: 0 },
      elevationGain: { type: Number, default: 0 },
    },
    achievements: [
      new Schema(
        { key: String, label: String, earnedAt: { type: Date, default: Date.now } },
        { _id: false },
      ),
    ],
    settings: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      density: { type: String, enum: ['compact', 'regular', 'comfy'], default: 'regular' },
      fontPair: { type: String, enum: ['a', 'b', 'c'], default: 'a' },
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      defaultTripVisibility: { type: String, enum: ['private', 'public'], default: 'private' },
      profileVisibility: { type: String, enum: ['private', 'public'], default: 'public' },
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        tripInvites: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
      },
    },
    counts: {
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
    lastActiveAt: Date,
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
