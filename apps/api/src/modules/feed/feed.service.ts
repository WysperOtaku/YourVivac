import type { FeedItem, Paginated } from '@yourvivac/types';
import { ActivityModel } from '../../models/activity.model.js';
import { FollowModel } from '../../models/social.model.js';

export const feedService = {
  async home(userId: string, page = 1, pageSize = 20): Promise<Paginated<FeedItem>> {
    const following = await FollowModel.find({ followerId: userId }).select('followingId');
    const actorIds = [...following.map((f) => f.followingId), userId];

    const filter = { actorId: { $in: actorIds } };
    const [activities, total] = await Promise.all([
      ActivityModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate('actorId', 'displayName username avatar role guide')
        .populate('tripId', 'title slug cover')
        .populate('tipId', 'title slug cover'),
      ActivityModel.countDocuments(filter),
    ]);

    const items: FeedItem[] = activities.map((a) => {
      const actor = a.actorId as unknown as { _id: unknown; displayName: string; username: string; avatar?: unknown; role: string };
      const trip = a.tripId as unknown as { _id: unknown; title: string; slug: string; cover?: unknown } | null;
      const tip = a.tipId as unknown as { _id: unknown; title: string; slug: string; cover?: unknown } | null;
      return {
        activityId: String(a._id),
        actor: {
          id: String(actor._id),
          displayName: actor.displayName,
          username: actor.username,
          avatar: actor.avatar as never,
          role: actor.role as never,
        },
        type: a.type,
        trip: trip ? { id: String(trip._id), title: trip.title, slug: trip.slug, cover: trip.cover as never } : undefined,
        tip: tip ? { id: String(tip._id), title: tip.title, slug: tip.slug, cover: tip.cover as never } : undefined,
        createdAt: (a.createdAt as Date).toISOString(),
      };
    });

    return { items, total, page, pageSize, hasMore: page * pageSize < total };
  },
};
