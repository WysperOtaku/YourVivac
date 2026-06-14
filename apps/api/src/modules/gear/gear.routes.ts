import { Router } from 'express';
import {
  createGearListSchema,
  gearItemSchema,
  updateGearItemSchema,
  productSearchQuerySchema,
} from '@yourvivac/validation';
import { authGuard, validate } from '../../middleware/index.js';
import { gearController } from './gear.controller.js';

export const gearRouter = Router();
gearRouter.get('/', authGuard, gearController.list);
gearRouter.post('/', authGuard, validate(createGearListSchema), gearController.create);
gearRouter.post('/:id/items', authGuard, validate(gearItemSchema), gearController.addItem);
gearRouter.patch(
  '/:id/items/:itemId',
  authGuard,
  validate(updateGearItemSchema),
  gearController.updateItem,
);

export const productsRouter = Router();
productsRouter.get(
  '/search',
  authGuard,
  validate(productSearchQuerySchema, 'query'),
  gearController.search,
);
productsRouter.get('/:store/:externalId', authGuard, gearController.product);
