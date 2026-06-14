import { UserModel } from '../../models/user.model.js';
import { TripModel } from '../../models/trip.model.js';
import { TipModel } from '../../models/tip.model.js';
import { GuideApplicationModel } from '../../models/guideApplication.model.js';
import { ReportModel, DailyMetricsModel } from '../../models/ops.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDoc, serializeDocs } from '../../lib/serialize.js';
import { HttpError } from '../../middleware/error.js';

export const adminService = {
  async metrics() {
    const [users, trips, tips, pendingGuides, openReports] = await Promise.all([
      UserModel.countDocuments({}),
      TripModel.countDocuments({}),
      TipModel.countDocuments({ status: 'published' }),
      GuideApplicationModel.countDocuments({ status: { $in: ['pending', 'in_review'] } }),
      ReportModel.countDocuments({ status: 'open' }),
    ]);
    return { users, trips, tips, pendingGuides, openReports };
  },

  async timeseries(from: string, to: string, metric: string) {
    const docs = await DailyMetricsModel.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });
    return docs.map((d) => ({ date: d.date, value: (d.get(metric) as number | undefined) ?? 0 }));
  },

  async users(page = 1, pageSize = 25, q?: string) {
    const filter: Record<string, unknown> = {};
    if (q) filter.$or = [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    const [docs, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      UserModel.countDocuments(filter),
    ]);
    return { items: serializeDocs(docs), total, page, pageSize, hasMore: page * pageSize < total };
  },

  async updateUser(id: string, patch: { role?: string; status?: string }) {
    const user = await UserModel.findByIdAndUpdate(id, { $set: patch }, { new: true });
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return serializeDoc(user);
  },

  async guideApplications(status?: string) {
    const filter = status ? { status } : {};
    const docs = await GuideApplicationModel.find(filter).sort({ createdAt: -1 }).populate('userId', 'displayName username avatar');
    return serializeDocs(docs);
  },

  async reviewGuide(id: string, adminId: string, decision: 'approve' | 'reject', notes?: string) {
    const app = await GuideApplicationModel.findById(id);
    if (!app) throw HttpError.notFound('Solicitud no encontrada');
    if (decision === 'approve') {
      app.status = 'approved';
      app.reviewedBy = adminId as never;
      app.reviewedAt = new Date();
      await app.save();
      await UserModel.updateOne(
        { _id: app.userId },
        { $set: { role: 'guide', 'guide.status': 'approved', 'guide.verifiedAt': new Date(), 'guide.verifiedBy': adminId } },
      );
      await NotificationModel.create({ userId: app.userId, type: 'guide_approved', actorId: adminId, target: { type: 'guideApplication', id } });
    } else {
      app.status = 'rejected';
      app.reviewedBy = adminId as never;
      app.reviewedAt = new Date();
      app.notes = notes;
      await app.save();
      await UserModel.updateOne({ _id: app.userId }, { $set: { 'guide.status': 'rejected' } });
      await NotificationModel.create({ userId: app.userId, type: 'guide_rejected', actorId: adminId, target: { type: 'guideApplication', id }, data: { notes } });
    }
    return serializeDoc(app);
  },

  async reports() {
    const docs = await ReportModel.find({}).sort({ createdAt: -1 });
    return serializeDocs(docs);
  },

  async resolveReport(id: string, adminId: string, status: 'resolved' | 'dismissed', action: string) {
    const report = await ReportModel.findById(id);
    if (!report) throw HttpError.notFound('Reporte no encontrado');
    report.status = status;
    report.handledBy = adminId as never;
    report.resolvedAt = new Date();
    await report.save();
    if (action === 'suspend_user') {
      await UserModel.updateOne({ _id: report.targetId }, { $set: { status: 'suspended' } });
    }
    return serializeDoc(report);
  },
};
