import { Router } from 'express';
import {
  createGearListSchema,
  gearItemSchema,
  updateGearItemSchema,
  productSearchQuerySchema,
} from '@yourvivac/validation';
import { authGuard, validate, notImplemented } from '../../middleware/index.js';

// Worker (gear & products): implementa gear.service.ts (UC-G2). El buscador de
// productos hace de PROXY a Cordal vía lib/storeService (NO scrapea aquí).
export const gearRouter = Router();
gearRouter.get('/', authGuard, notImplemented('gear.list'));
gearRouter.post('/', authGuard, validate(createGearListSchema), notImplemented('gear.create'));
gearRouter.post('/:id/items', authGuard, validate(gearItemSchema), notImplemented('gear.addItem'));
gearRouter.patch(
  '/:id/items/:itemId',
  authGuard,
  validate(updateGearItemSchema),
  notImplemented('gear.updateItem'),
);

export const productsRouter = Router();
productsRouter.get(
  '/search',
  authGuard,
  validate(productSearchQuerySchema, 'query'),
  notImplemented('products.search'),
);
productsRouter.get('/:store/:externalId', authGuard, notImplemented('products.get'));
