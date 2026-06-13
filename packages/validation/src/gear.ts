import { z } from 'zod';
import { storeKey } from './common.js';

export const gearProduct = z.object({
  storeKey,
  title: z.string().min(1),
  url: z.string().url(),
  price: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  image: z.string().url().optional(),
  externalId: z.string().optional(),
});

export const createGearListSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().max(40).optional(),
  visibility: z.enum(['private', 'trip', 'public']).default('private'),
});

export const gearItemSchema = z.object({
  name: z.string().min(1).max(120),
  weightGrams: z.number().int().min(0).max(100_000).optional(),
  product: gearProduct.optional(),
});

export const updateGearItemSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    weightGrams: z.number().int().min(0).max(100_000).optional(),
    checked: z.boolean().optional(),
  })
  .strict();

export const productSearchQuerySchema = z.object({
  q: z.string().min(2).max(120),
  stores: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
