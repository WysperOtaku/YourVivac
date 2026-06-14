import type { GuideApplyRequest } from '@yourvivac/types';
import { GuideApplicationModel } from '../../models/guideApplication.model.js';
import { UserModel } from '../../models/user.model.js';
import { NotificationModel } from '../../models/notification.model.js';
import { serializeDoc } from '../../lib/serialize.js';
import { HttpError } from '../../middleware/error.js';

export const guideService = {
  async apply(userId: string, input: GuideApplyRequest) {
    const open = await GuideApplicationModel.findOne({
      userId,
      status: { $in: ['pending', 'in_review', 'approved'] },
    });
    if (open) throw HttpError.conflict('Ya tienes una solicitud de guía en curso');

    const application = await GuideApplicationModel.create({
      userId,
      certification: input.certification,
      certBody: input.certBody,
      documents: input.documents,
      status: 'pending',
    });
    await UserModel.updateOne(
      { _id: userId },
      { $set: { 'guide.status': 'pending', 'guide.certification': input.certification, 'guide.certBody': input.certBody } },
    );

    // Notifica a los admins.
    const admins = await UserModel.find({ role: 'admin' }).select('_id');
    await NotificationModel.insertMany(
      admins.map((a) => ({
        userId: a._id,
        type: 'help_request',
        actorId: userId,
        target: { type: 'guideApplication', id: application._id },
      })),
    );
    return serializeDoc(application);
  },

  async myApplication(userId: string) {
    const application = await GuideApplicationModel.findOne({ userId }).sort({ createdAt: -1 });
    return application ? serializeDoc(application) : null;
  },
};
