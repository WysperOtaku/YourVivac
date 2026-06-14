import sanitizeHtml from 'sanitize-html';
import type { CreateTipRequest, Paginated, Tip, UpdateTipRequest } from '@yourvivac/types';
import { uniqueSlug, readingMinutes } from '@yourvivac/utils';
import { TipModel } from '../../models/tip.model.js';
import { ReactionModel, CommentModel } from '../../models/social.model.js';
import { ActivityModel } from '../../models/activity.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { HttpError } from '../../middleware/error.js';

const mdSanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt'] },
};

export const tipsService = {
  async feed(category: string | undefined, page = 1, pageSize = 20): Promise<Paginated<Tip>> {
    const filter: Record<string, unknown> = { status: 'published', 'moderation.status': 'ok' };
    if (category) filter.category = category;
    const [docs, total] = await Promise.all([
      TipModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      TipModel.countDocuments(filter),
    ]);
    return { items: serializeDocs<Tip>(docs), total, page, pageSize, hasMore: page * pageSize < total };
  },

  async create(userId: string, input: CreateTipRequest): Promise<Tip> {
    const contentMarkdown = sanitizeHtml(input.contentMarkdown, mdSanitizeOpts);
    const status = input.status ?? 'draft';
    const tip = await TipModel.create({
      authorId: userId,
      title: input.title,
      slug: uniqueSlug(input.title),
      cover: input.cover,
      excerpt: input.excerpt,
      category: input.category,
      contentMarkdown,
      readMinutes: readingMinutes(contentMarkdown),
      tags: input.tags ?? [],
      status,
      publishedAt: status === 'published' ? new Date() : undefined,
    });
    if (status === 'published') {
      await ActivityModel.create({ actorId: userId, type: 'tip_published', tipId: tip._id, visibility: 'public' });
    }
    return serializeDoc<Tip>(tip);
  },

  async getBySlug(slug: string): Promise<Tip> {
    const tip = await TipModel.findOneAndUpdate({ slug }, { $inc: { 'counts.views': 1 } }, { new: true });
    if (!tip) throw HttpError.notFound('Consejo no encontrado');
    return serializeDoc<Tip>(tip);
  },

  async update(tipId: string, userId: string, patch: UpdateTipRequest): Promise<Tip> {
    const tip = await TipModel.findById(tipId);
    if (!tip) throw HttpError.notFound('Consejo no encontrado');
    if (String(tip.authorId) !== userId) throw HttpError.forbidden('Solo el autor puede editar');
    if (patch.contentMarkdown !== undefined) {
      tip.contentMarkdown = sanitizeHtml(patch.contentMarkdown, mdSanitizeOpts);
      tip.readMinutes = readingMinutes(tip.contentMarkdown);
    }
    if (patch.title !== undefined) tip.title = patch.title;
    if (patch.excerpt !== undefined) tip.excerpt = patch.excerpt;
    if (patch.category !== undefined) tip.category = patch.category;
    if (patch.tags !== undefined) tip.tags = patch.tags;
    if (patch.cover !== undefined) tip.cover = patch.cover as never;
    if (patch.status !== undefined) {
      if (patch.status === 'published' && !tip.publishedAt) tip.publishedAt = new Date();
      tip.status = patch.status;
    }
    await tip.save();
    return serializeDoc<Tip>(tip);
  },

  async like(tipId: string, userId: string): Promise<void> {
    const tip = await TipModel.findById(tipId);
    if (!tip) throw HttpError.notFound('Consejo no encontrado');
    const res = await ReactionModel.updateOne(
      { userId, targetType: 'tip', targetId: tipId },
      { $setOnInsert: { userId, targetType: 'tip', targetId: tipId } },
      { upsert: true },
    );
    if (res.upsertedCount && res.upsertedCount > 0) {
      await TipModel.updateOne({ _id: tipId }, { $inc: { 'counts.likes': 1 } });
      if (String(tip.authorId) !== userId) {
        await NotificationModel.create({
          userId: tip.authorId,
          type: 'tip_like',
          actorId: userId,
          target: { type: 'tip', id: tipId },
        });
      }
    }
  },

  async comment(tipId: string, userId: string, body: string, parentId?: string): Promise<void> {
    const tip = await TipModel.findById(tipId);
    if (!tip) throw HttpError.notFound('Consejo no encontrado');
    await CommentModel.create({ authorId: userId, targetType: 'tip', targetId: tipId, body, parentId });
    await TipModel.updateOne({ _id: tipId }, { $inc: { 'counts.comments': 1 } });
    if (String(tip.authorId) !== userId) {
      await NotificationModel.create({
        userId: tip.authorId,
        type: 'comment',
        actorId: userId,
        target: { type: 'tip', id: tipId },
      });
    }
  },
};
