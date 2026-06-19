import type {
  CreateTripRequest,
  GuideApplicationStatus,
  PublicUser,
  Trip,
  UpdateTripRequest,
  Rsvp,
} from '@yourvivac/types';
import { uniqueSlug } from '@yourvivac/utils';
import { TripModel } from '../../models/trip.model.js';
import { ActivityModel } from '../../models/activity.model.js';
import { UserModel } from '../../models/user.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { HttpError } from '../../middleware/error.js';

function isMember(trip: { members: { userId: unknown }[] }, userId: string): boolean {
  return trip.members.some((m) => String(m.userId) === userId);
}

/** Adjunta las identidades públicas de los miembros a una o varias salidas. */
async function attachMemberUsers<T extends Trip>(trips: T[]): Promise<T[]> {
  const ids = [...new Set(trips.flatMap((t) => t.members.map((m) => String(m.userId))))];
  if (ids.length === 0) return trips;
  const users = await UserModel.find({ _id: { $in: ids } }).select(
    'displayName username avatar role guide.status guide.certBody',
  );
  const map = new Map<string, PublicUser>(
    users.map((u): [string, PublicUser] => [
      String(u._id),
      {
        id: String(u._id),
        displayName: u.displayName,
        username: u.username,
        avatar: u.avatar?.url ? { url: u.avatar.url, publicId: u.avatar.publicId ?? '' } : undefined,
        role: u.role,
        guide: u.guide?.status
          ? { status: u.guide.status as GuideApplicationStatus, certBody: u.guide.certBody ?? undefined }
          : undefined,
      },
    ]),
  );
  return trips.map((t) => ({
    ...t,
    memberUsers: t.members
      .map((m) => map.get(String(m.userId)))
      .filter((u): u is PublicUser => Boolean(u)),
  }));
}

export const tripsService = {
  async create(userId: string, input: CreateTripRequest): Promise<Trip> {
    const trip = await TripModel.create({
      ...input,
      slug: uniqueSlug(input.title),
      owner: userId,
      members: [{ userId, role: 'owner', rsvp: 'going', joinedAt: new Date() }],
      status: 'planning',
    });
    return serializeDoc<Trip>(trip);
  },

  async listForUser(userId: string): Promise<Trip[]> {
    const trips = await TripModel.find({ 'members.userId': userId }).sort({ startDate: 1 });
    return attachMemberUsers(serializeDocs<Trip>(trips));
  },

  async getForMember(tripId: string, userId: string): Promise<Trip> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    if (!isMember(trip, userId) && trip.visibility !== 'public') {
      throw HttpError.forbidden('No eres miembro de esta salida');
    }
    const [withUsers] = await attachMemberUsers([serializeDoc<Trip>(trip)]);
    return withUsers!;
  },

  async update(tripId: string, userId: string, patch: UpdateTripRequest): Promise<Trip> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    if (String(trip.owner) !== userId) throw HttpError.forbidden('Solo el owner puede editar');
    Object.assign(trip, patch);
    await trip.save();
    return serializeDoc<Trip>(trip);
  },

  async remove(tripId: string, userId: string): Promise<void> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    if (String(trip.owner) !== userId) throw HttpError.forbidden('Solo el owner puede eliminar');
    await trip.deleteOne();
  },

  async invite(tripId: string, userId: string, invitees: string[]): Promise<Trip> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    if (!isMember(trip, userId)) throw HttpError.forbidden('No eres miembro de esta salida');

    // Resuelve handles o ids → usuarios.
    const users = await UserModel.find({
      $or: [{ _id: { $in: invitees.filter((i) => /^[a-f\d]{24}$/i.test(i)) } }, { username: { $in: invitees } }],
    });
    for (const u of users) {
      const uid = String(u._id);
      if (isMember(trip, uid)) continue; // idempotente
      trip.members.push({ userId: u._id, role: 'member', rsvp: 'invited', joinedAt: new Date() });
      await NotificationModel.create({
        userId: u._id,
        type: 'trip_invite',
        actorId: userId,
        target: { type: 'trip', id: trip._id },
      });
    }
    await trip.save();
    return serializeDoc<Trip>(trip);
  },

  async rsvp(tripId: string, userId: string, rsvp: Rsvp): Promise<Trip> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    const member = trip.members.find((m) => String(m.userId) === userId);
    if (!member) throw HttpError.forbidden('No eres miembro de esta salida');
    member.rsvp = rsvp;
    await trip.save();
    return serializeDoc<Trip>(trip);
  },

  async complete(tripId: string, userId: string): Promise<Trip> {
    const trip = await TripModel.findById(tripId);
    if (!trip) throw HttpError.notFound('Salida no encontrada');
    if (String(trip.owner) !== userId) throw HttpError.forbidden('Solo el owner puede completar');
    if (trip.status === 'completed') throw HttpError.conflict('La salida ya está completada');

    trip.status = 'completed';
    trip.completedAt = new Date();
    await trip.save();

    const goingIds = trip.members.filter((m) => m.rsvp === 'going').map((m) => m.userId);
    const nights = Math.max(
      0,
      Math.round((trip.endDate.getTime() - trip.startDate.getTime()) / 86_400_000),
    );
    await UserModel.updateMany(
      { _id: { $in: goingIds } },
      {
        $inc: {
          'stats.trips': 1,
          'stats.vivacs': nights > 0 ? 1 : 0,
          'stats.distanceKm': trip.distanceKm ?? 0,
          'stats.elevationGain': trip.elevationGain ?? 0,
        },
      },
    );

    await ActivityModel.create({
      actorId: userId,
      type: 'trip_completed',
      tripId: trip._id,
      visibility: trip.visibility,
    });
    return serializeDoc<Trip>(trip);
  },

  async explore(query: {
    q?: string;
    difficulty?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Trip[]; total: number; page: number; pageSize: number; hasMore: boolean }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const filter: Record<string, unknown> = { visibility: 'public' };
    if (query.q) filter.title = { $regex: query.q, $options: 'i' };
    if (query.difficulty) filter.difficulty = query.difficulty;
    const [docs, total] = await Promise.all([
      TripModel.find(filter)
        .sort({ startDate: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      TripModel.countDocuments(filter),
    ]);
    return {
      items: await attachMemberUsers(serializeDocs<Trip>(docs)),
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    };
  },
};
