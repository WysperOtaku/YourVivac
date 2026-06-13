import { Router } from 'express';
import {
  adminUpdateUserSchema,
  adminReviewGuideSchema,
  adminResolveReportSchema,
} from '@yourvivac/validation';
import { authGuard, roleGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (admin): implementa admin.service.ts (UC-AD1/AD2). Todo bajo rol admin.
export const adminRouter = Router();

adminRouter.use(authGuard, roleGuard('admin'));

adminRouter.get('/metrics', notImplemented('admin.metrics'));
adminRouter.get('/metrics/timeseries', notImplemented('admin.timeseries'));
adminRouter.get('/users', notImplemented('admin.users'));
adminRouter.patch('/users/:id', validate(adminUpdateUserSchema), notImplemented('admin.updateUser'));
adminRouter.get('/guide-applications', notImplemented('admin.guideApplications'));
adminRouter.patch(
  '/guide-applications/:id',
  validate(adminReviewGuideSchema),
  notImplemented('admin.reviewGuide'),
);
adminRouter.get('/reports', notImplemented('admin.reports'));
adminRouter.patch(
  '/reports/:id',
  validate(adminResolveReportSchema),
  notImplemented('admin.resolveReport'),
);
