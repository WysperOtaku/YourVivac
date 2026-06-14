import type { Trip, Tip, UpdateUserRequest, UpdateSettingsRequest, UserProfileResponse } from '@yourvivac/types';
import { UserModel } from '../../models/user.model.js';
import { FollowModel } from '../../models/social.model.js';
import { TripModel } from '../../models/trip.model.js';
import { TipModel } from '../../models/tip.model.js';
import { MediaModel } from '../../models/ops.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { optimizeImage } from '../../lib/images.js';
import { uploadBuffer } from '../../lib/cloudinary.js';
import { NotificationModel } from '../../models/notification.model.js';
import { HttpError } from '../../middleware/error.js';

export const usersService = {
  async profile(username: string, viewerId?: string): Promise<UserProfileResponse> {
    const user = await UserModel.findOne({ username });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    const isFollowing = viewerId
      ? Boolean(await FollowModel.exists({ followerId: viewerId, followingId: user._id }))
      : undefined;
    return {
      user: {
        id: String(user._id),
        displayName: user.displayName,
        username: user.username,
        avatar: user.avatar as never,
        role: user.role,
        guide: user.guide as never,
        bio: user.bio ?? undefined,
        location: user.location as never,
        stats: user.stats as never,
        achievements: user.achievements as never,
        counts: user.counts as never,
      },
      isFollowing,
    };
  },

  async updateMe(userId: string, patch: UpdateUserRequest) {
    const user = await UserModel.findByIdAndUpdate(userId, patch, { new: true });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return serializeDoc(user);
  },

  async updateSettings(userId: string, patch: UpdateSettingsRequest) {
    const set: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'notifications' && v && typeof v === 'object') {
        for (const [nk, nv] of Object.entries(v)) set[`settings.notifications.${nk}`] = nv;
      } else {
        set[`settings.${k}`] = v;
      }
    }
    const user = await UserModel.findByIdAndUpdate(userId, { $set: set }, { new: true });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return serializeDoc(user);
  },

  async setAvatar(userId: string, file: Express.Multer.File) {
    if (!file.mimetype.startsWith('image/')) throw HttpError.badRequest('El archivo debe ser una imagen');
    const optimized = await optimizeImage(file.buffer);
    const uploaded = await uploadBuffer(optimized, 'yourvivac/avatars');
    await MediaModel.create({
      uploaderId: userId,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      moderation: { status: 'approved', labels: [] },
    });
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: { url: uploaded.url, publicId: uploaded.publicId } },
      { new: true },
    );
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return serializeDoc(user);
  },

  async userTrips(userId: string): Promise<Trip[]> {
    const trips = await TripModel.find({ owner: userId, visibility: 'public' }).sort({ startDate: -1 });
    return serializeDocs<Trip>(trips);
  },

  async userTips(userId: string): Promise<Tip[]> {
    const tips = await TipModel.find({ authorId: userId, status: 'published' }).sort({ publishedAt: -1 });
    return serializeDocs<Tip>(tips);
  },

  async follow(followerId: string, targetId: string): Promise<void> {
    if (followerId === targetId) throw HttpError.badRequest('No puedes seguirte a ti mismo');
    const target = await UserModel.exists({ _id: targetId });
    if (!target) throw HttpError.notFound('Usuario no encontrado');
    const res = await FollowModel.updateOne(
      { followerId, followingId: targetId },
      { $setOnInsert: { followerId, followingId: targetId } },
      { upsert: true },
    );
    // Solo actualiza contadores y notifica si es un follow nuevo (idempotente).
    if (res.upsertedCount && res.upsertedCount > 0) {
      await UserModel.updateOne({ _id: followerId }, { $inc: { 'counts.following': 1 } });
      await UserModel.updateOne({ _id: targetId }, { $inc: { 'counts.followers': 1 } });
      await NotificationModel.create({
        userId: targetId,
        type: 'follow',
        actorId: followerId,
        target: { type: 'user', id: followerId },
      });
    }
  },

  async unfollow(followerId: string, targetId: string): Promise<void> {
    const res = await FollowModel.deleteOne({ followerId, followingId: targetId });
    if (res.deletedCount && res.deletedCount > 0) {
      await UserModel.updateOne({ _id: followerId }, { $inc: { 'counts.following': -1 } });
      await UserModel.updateOne({ _id: targetId }, { $inc: { 'counts.followers': -1 } });
    }
  },
};
