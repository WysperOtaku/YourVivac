import { z } from 'zod';

/** Esquema de variables de entorno (Guía de desarrollo §16). Validado al arrancar. */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  MONGODB_URI: z.string().default('mongodb://localhost:27017/yourvivac'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-me'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  BREVO_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('YourVivac <no-reply@yourvivac.app>'),

  STORE_SERVICE_URL: z.string().default('http://localhost:5000'),
  STORE_SERVICE_API_KEY: z.string().optional(),

  GOOGLE_MAPS_API_KEY: z.string().optional(),
  MODERATION_PROVIDER_KEY: z.string().optional(),

  // Almacenamiento de teselas/blobs. En dev: disco local; en prod: Azure Blob.
  STORAGE_DRIVER: z.enum(['local', 'azure']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('.data/storage'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_BLOB_CONTAINER: z.string().default('yourvivac-tiles'),

  // Mapa topográfico IGN (España). Servicios públicos y gratuitos.
  IGN_WMTS_BASE: z.string().default('https://www.ign.es/wmts'),
  IGN_VECTOR_BASE: z.string().default('https://vt-ign.idee.es'),
  IGN_STYLE_BASE: z.string().default('https://www.ign.es/web/resources/mapa-base-ign/estilos'),
  // Geocoder de topónimos del IGN (CartoCiudad / nominatim-style).
  IGN_GEOCODER_URL: z.string().default('https://www.cartociudad.es/geocoder/api/geocoder'),

  // Motor de rutas BRouter self-host (docker compose service `brouter`).
  BROUTER_URL: z.string().default('http://localhost:17777'),

  // TTL de caché de teselas en segundos (30 días por defecto).
  TILE_CACHE_TTL: z.coerce.number().default(2_592_000),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:19006'),

  // Cookie de refresh. En local sobre http debe ser secure=false (si no, el navegador
  // la descarta). En producción cross-site (https): secure=true, sameSite=none.
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida');
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim());
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
