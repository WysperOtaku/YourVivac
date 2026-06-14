import { Router } from 'express';
import {
  adminUpdateUserSchema,
  adminReviewGuideSchema,
  adminResolveReportSchema,
} from '@yourvivac/validation';
import { authGuard, roleGuard, validate, asyncHandler } from '../../middleware/index.js';
import { adminService } from './admin.service.js';

export const adminRouter = Router();

adminRouter.use(authGuard, roleGuard('admin'));

adminRouter.get(
  '/metrics',
  asyncHandler(async (_req, res) => res.json(await adminService.metrics())),
);
adminRouter.get(
  '/metrics/timeseries',
  asyncHandler(async (req, res) =>
    res.json(
      await adminService.timeseries(
        String(req.query.from),
        String(req.query.to),
        String(req.query.metric ?? 'newUsers'),
      ),
    ),
  ),
);
adminRouter.get(
  '/users',
  asyncHandler(async (req, res) =>
    res.json(
      await adminService.users(
        req.query.page ? Number(req.query.page) : 1,
        req.query.pageSize ? Number(req.query.pageSize) : 25,
        req.query.q as string | undefined,
      ),
    ),
  ),
);
adminRouter.patch(
  '/users/:id',
  validate(adminUpdateUserSchema),
  asyncHandler(async (req, res) => res.json(await adminService.updateUser(req.params.id, req.body))),
);
adminRouter.get(
  '/guide-applications',
  asyncHandler(async (req, res) =>
    res.json(await adminService.guideApplications(req.query.status as string | undefined)),
  ),
);
adminRouter.patch(
  '/guide-applications/:id',
  validate(adminReviewGuideSchema),
  asyncHandler(async (req, res) =>
    res.json(await adminService.reviewGuide(req.params.id, req.user!.userId, req.body.decision, req.body.notes)),
  ),
);
adminRouter.get(
  '/reports',
  asyncHandler(async (_req, res) => res.json(await adminService.reports())),
);
adminRouter.patch(
  '/reports/:id',
  validate(adminResolveReportSchema),
  asyncHandler(async (req, res) =>
    res.json(await adminService.resolveReport(req.params.id, req.user!.userId, req.body.status, req.body.action)),
  ),
);
