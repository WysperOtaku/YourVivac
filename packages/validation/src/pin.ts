import { z } from 'zod';
import { coords, mediaRef, objectId } from './common.js';

export const pinLayout = z.object({
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  z: z.number().int().default(0),
  w: z.number().positive().default(200),
});

const base = { layout: pinLayout };

/** Unión discriminada por `type` — cada tipo de pin valida su propio payload. */
export const createPinSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('note'), note: z.object({ markdown: z.string().min(1).max(8000) }) }),
  z.object({
    ...base,
    type: z.literal('text'),
    text: z.object({ body: z.string().min(1).max(500), color: z.string().min(1) }),
  }),
  z.object({
    ...base,
    type: z.literal('photo'),
    photo: z.object({ media: mediaRef, caption: z.string().max(280).optional() }),
  }),
  z.object({ ...base, type: z.literal('link'), link: z.object({ url: z.string().url() }) }),
  z.object({
    ...base,
    type: z.literal('map'),
    map: z.object({
      label: z.string().min(1),
      coords,
      placeId: z.string().optional(),
      address: z.string().optional(),
      path: z.array(coords).max(1000).optional(),
    }),
  }),
  z.object({ ...base, type: z.literal('list'), list: z.object({ gearListId: objectId }) }),
]);

export const updatePinSchema = z
  .object({
    layout: pinLayout.partial().optional(),
    note: z.object({ markdown: z.string().min(1).max(8000) }).optional(),
    text: z
      .object({ body: z.string().min(1).max(500).optional(), color: z.string().optional() })
      .optional(),
  })
  .strict();

export const reactionSchema = z.object({
  emoji: z.string().min(1).max(8),
});

export type CreatePinInput = z.infer<typeof createPinSchema>;
