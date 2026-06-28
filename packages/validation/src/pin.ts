import { z } from 'zod';
import { coords, mediaRef, objectId } from './common.js';

export const topoLayer = z.enum(['base', 'mtn', 'relieve', 'ortofoto']);
export const topoMarkKind = z.enum([
  'cumbre',
  'refugio',
  'fuente',
  'vivac',
  'parking',
  'cruce',
  'punto',
]);
export const routeProfile = z.enum(['hiking', 'trekking', 'mountain']);

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
  z.object({
    ...base,
    type: z.literal('topo'),
    topo: z.object({
      label: z.string().min(1).max(120),
      center: coords,
      zoom: z.number().min(1).max(20),
      layer: topoLayer,
      marks: z
        .array(
          z.object({
            coords,
            kind: topoMarkKind,
            label: z.string().max(80).optional(),
          }),
        )
        .max(100)
        .optional(),
    }),
  }),
  z.object({
    ...base,
    type: z.literal('route'),
    route: z.object({
      name: z.string().min(1).max(120),
      profile: routeProfile,
      waypoints: z.array(coords).min(2).max(50),
      geometry: z.array(coords).min(2).max(20000),
      distanceM: z.number().nonnegative(),
      ascentM: z.number().nonnegative(),
      descentM: z.number().nonnegative(),
      durationMin: z.number().nonnegative().optional(),
      layer: topoLayer.optional(),
    }),
  }),
]);

// Edición de pin: layout y/o el contenido del propio tipo (el servidor solo
// aplica la clave que coincide con el tipo del pin). Reutiliza las mismas formas
// que la creación para que el autor/propietario pueda editar cualquier pin.
export const updatePinSchema = z
  .object({
    layout: pinLayout.partial().optional(),
    note: z.object({ markdown: z.string().min(1).max(8000) }).optional(),
    text: z
      .object({ body: z.string().min(1).max(500).optional(), color: z.string().optional() })
      .optional(),
    photo: z.object({ media: mediaRef, caption: z.string().max(280).optional() }).optional(),
    link: z.object({ url: z.string().url() }).optional(),
    map: z
      .object({
        label: z.string().min(1),
        coords,
        placeId: z.string().optional(),
        address: z.string().optional(),
        path: z.array(coords).max(1000).optional(),
      })
      .optional(),
    topo: z
      .object({
        label: z.string().min(1).max(120),
        center: coords,
        zoom: z.number().min(1).max(20),
        layer: topoLayer,
        marks: z
          .array(z.object({ coords, kind: topoMarkKind, label: z.string().max(80).optional() }))
          .max(100)
          .optional(),
      })
      .optional(),
    route: z
      .object({
        name: z.string().min(1).max(120),
        profile: routeProfile,
        waypoints: z.array(coords).min(2).max(50),
        geometry: z.array(coords).min(2).max(20000),
        distanceM: z.number().nonnegative(),
        ascentM: z.number().nonnegative(),
        descentM: z.number().nonnegative(),
        durationMin: z.number().nonnegative().optional(),
        layer: topoLayer.optional(),
      })
      .optional(),
    list: z.object({ gearListId: objectId }).optional(),
  })
  .strict();

export const reactionSchema = z.object({
  emoji: z.string().min(1).max(8),
});

/** Cuerpo de `POST /routing`: perfil + waypoints (mín. origen y destino). */
export const routeRequestSchema = z.object({
  profile: routeProfile.default('hiking'),
  waypoints: z.array(coords).min(2).max(50),
});

/** Query del geocoder `GET /maps/search?q=`. */
export const geocodeQuerySchema = z.object({
  q: z.string().min(2).max(120),
});

export type CreatePinInput = z.infer<typeof createPinSchema>;
export type RouteRequestInput = z.infer<typeof routeRequestSchema>;
