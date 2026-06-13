import { z } from 'zod';
import { coords } from './common.js';

export const difficulty = z.enum(['facil', 'moderada', 'dificil', 'alpina']);
export const visibility = z.enum(['private', 'public']);
export const rsvp = z.enum(['invited', 'going', 'maybe', 'declined']);

export const createTripSchema = z
  .object({
    title: z.string().min(3).max(120),
    description: z.string().max(4000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    location: z.object({
      name: z.string().min(1),
      coords,
      placeId: z.string().optional(),
    }),
    difficulty,
    visibility,
    distanceKm: z.number().min(0).optional(),
    elevationGain: z.number().min(0).optional(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'endDate debe ser >= startDate',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    title: z.string().min(3).max(120).optional(),
    description: z.string().max(4000).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    location: z
      .object({ name: z.string().min(1), coords, placeId: z.string().optional() })
      .optional(),
    difficulty: difficulty.optional(),
    visibility: visibility.optional(),
    distanceKm: z.number().min(0).optional(),
    elevationGain: z.number().min(0).optional(),
  })
  .strict();

export const inviteSchema = z.object({
  users: z.array(z.string().min(1)).min(1).max(50),
});

export const rsvpSchema = z.object({
  rsvp,
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
