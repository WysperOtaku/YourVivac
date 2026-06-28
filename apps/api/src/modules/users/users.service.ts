import type {
  Trip,
  Tip,
  UpdateUserRequest,
  UpdateSettingsRequest,
  UserProfileResponse,
  UserSearchResult,
  UserSuggestion,
} from '@yourvivac/types';
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

/** Forma mínima de un documento de usuario necesaria para construir el resultado público. */
type UserRowSource = {
  _id: unknown;
  displayName: string;
  username: string;
  avatar?: { url?: string | null; publicId?: string | null } | null;
  role: 'user' | 'guide' | 'admin';
};

/** Mapea un documento de usuario a la forma pública UserSearchResult/UserSuggestion. */
function toUserResult(u: UserRowSource): UserSearchResult {
  return {
    id: String(u._id),
    displayName: u.displayName,
    username: u.username,
    avatar: u.avatar ? { url: u.avatar.url ?? '', publicId: u.avatar.publicId ?? '' } : undefined,
    role: u.role,
  };
}

export const usersService = {
  async profile(username: string, viewerId?: string): Promise<UserProfileResponse> {
    const user = await UserModel.findOne({ username });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    if (user.settings?.profileVisibility === 'private' && viewerId !== String(user._id)) {
      throw HttpError.forbidden('Este perfil es privado');
    }
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
    if (patch.username || patch.email) {
      const conflict = await UserModel.findOne({
        _id: { $ne: userId },
        $or: [
          ...(patch.username ? [{ username: patch.username }] : []),
          ...(patch.email ? [{ email: patch.email }] : []),
        ],
      });
      if (conflict) throw HttpError.conflict('Ese email o nombre de usuario ya está en uso');
    }
    const update: Record<string, unknown> = { ...patch };
    if (patch.email) update.emailVerified = false; // re-verificar al cambiar email
    const user = await UserModel.findByIdAndUpdate(userId, update, { new: true });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return serializeDoc(user);
  },

  async search(q: string): Promise<UserSearchResult[]> {
    const term = q?.trim();
    if (!term || term.length < 2) return [];
    const rx = { $regex: term, $options: 'i' };
    // Empareja por @usuario, nombre o email exacto (insensible a mayúsculas).
    const or: Record<string, unknown>[] = [{ username: rx }, { displayName: rx }];
    if (term.includes('@')) or.push({ email: term.toLowerCase() });
    const docs = await UserModel.find({ status: 'active', $or: or }).limit(10);
    return docs.map(toUserResult);
  },

  async suggestions(userId: string): Promise<UserSuggestion[]> {
    const LIMIT = 12;
    // Conserva el orden de relevancia: primero a quién sigues, luego co-miembros.
    const ids: string[] = [];
    const seen = new Set<string>([userId]); // excluye al propio usuario desde el inicio
    const add = (id?: unknown) => {
      const s = id == null ? '' : String(id);
      if (s && !seen.has(s)) {
        seen.add(s);
        ids.push(s);
      }
    };

    // 1) Personas a las que el usuario sigue (lo más relevante).
    const follows = await FollowModel.find({ followerId: userId }).sort({ createdAt: -1 }).limit(LIMIT);
    for (const f of follows) add(f.followingId);

    // 2) Si hay pocas, completa con co-miembros recientes de sus salidas.
    if (ids.length < LIMIT) {
      const trips = await TripModel.find({ $or: [{ owner: userId }, { 'members.userId': userId }] })
        .sort({ updatedAt: -1 })
        .limit(20);
      for (const t of trips) {
        add(t.owner);
        for (const m of t.members ?? []) add(m?.userId);
        if (ids.length >= LIMIT) break;
      }
    }

    const finalIds = ids.slice(0, LIMIT);
    if (finalIds.length === 0) return [];

    const docs = await UserModel.find({ _id: { $in: finalIds }, status: 'active' });
    const byId = new Map(docs.map((u) => [String(u._id), u]));
    // Reordena según la relevancia calculada (el $in no garantiza orden).
    return finalIds
      .map((id) => byId.get(id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u))
      .map(toUserResult);
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
