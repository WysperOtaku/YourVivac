import { z } from 'zod';
import { mediaRef, objectId } from './common.js';

// --- Tips / consejos ---
export const tipCategory = z.enum(['material', 'seguridad', 'rutas', 'vivac', 'meteo']);

export const createTipSchema = z.object({
  title: z.string().min(3).max(140),
  category: tipCategory,
  contentMarkdown: z.string().min(1).max(50_000),
  excerpt: z.string().max(300).optional(),
  cover: mediaRef.optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const updateTipSchema = createTipSchema.partial().strict();

export const commentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: objectId.optional(),
});

// --- Chat ---
export const sendMessageSchema = z
  .object({
    body: z.string().min(1).max(4000).optional(),
    type: z.enum(['text', 'pin_share']).default('text'),
    pinRef: objectId.optional(),
    attachments: z.array(mediaRef).max(10).optional(),
  })
  .refine((d) => d.body || d.pinRef || (d.attachments && d.attachments.length > 0), {
    message: 'El mensaje necesita contenido',
  });

// --- Guide ---
export const guideApplySchema = z.object({
  certification: z.string().min(2).max(120),
  certBody: z.string().min(2).max(120),
  documents: z.array(mediaRef).min(1).max(10),
});

// --- Users / settings ---
export const updateUserSchema = z
  .object({
    displayName: z.string().min(2).max(60).optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(/^[a-z0-9_]+$/i, 'Solo letras, números y guion bajo')
      .optional(),
    email: z.string().email().optional(),
    bio: z.string().max(500).optional(),
    location: z
      .object({
        name: z.string().min(1),
        coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
      })
      .optional(),
  })
  .strict();

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(128),
});

export const updateSettingsSchema = z
  .object({
    theme: z.enum(['dark', 'light']).optional(),
    density: z.enum(['compact', 'regular', 'comfy']).optional(),
    fontPair: z.enum(['a', 'b', 'c']).optional(),
    units: z.enum(['metric', 'imperial']).optional(),
    defaultTripVisibility: z.enum(['private', 'public']).optional(),
    profileVisibility: z.enum(['private', 'public']).optional(),
    notifications: z
      .object({
        push: z.boolean().optional(),
        email: z.boolean().optional(),
        tripInvites: z.boolean().optional(),
        messages: z.boolean().optional(),
        mentions: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

// --- Admin ---
export const adminUpdateUserSchema = z
  .object({
    role: z.enum(['user', 'guide', 'admin']).optional(),
    status: z.enum(['active', 'suspended', 'banned']).optional(),
  })
  .strict();

export const adminReviewGuideSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: z.string().max(2000).optional(),
});

export const adminResolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  action: z.enum(['hide_content', 'suspend_user', 'none']).default('none'),
});
