import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ObjectId inválido');

export const coords = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const mediaRef = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const storeKey = z.enum([
  'amazon',
  'decathlon',
  'deporvillage',
  'barrabes',
  'forum',
  'coleman',
]);

/** Envuelve un esquema de cuerpo/params/query para el middleware `validate`. */
export function requestSchema<
  B extends z.ZodTypeAny = z.ZodTypeAny,
  P extends z.ZodTypeAny = z.ZodTypeAny,
  Q extends z.ZodTypeAny = z.ZodTypeAny,
>(parts: { body?: B; params?: P; query?: Q }) {
  return z.object({
    body: parts.body ?? (z.any() as unknown as B),
    params: parts.params ?? (z.any() as unknown as P),
    query: parts.query ?? (z.any() as unknown as Q),
  });
}
