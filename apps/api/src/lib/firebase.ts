import admin from 'firebase-admin';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let app: admin.app.App | null = null;

/** Inicializa firebase-admin de forma perezosa (sólo si hay credenciales). */
function getApp(): admin.app.App | null {
  if (app) return app;
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    logger.warn('Firebase no configurado: el login con Google no funcionará hasta añadir credenciales');
    return null;
  }
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  return app;
}

export interface GoogleIdentity {
  email: string;
  name?: string;
  picture?: string;
  uid: string;
  emailVerified: boolean;
}

/** Verifica el ID token de Google y devuelve la identidad. */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const firebaseApp = getApp();
  if (!firebaseApp) throw new Error('Firebase no configurado');
  const decoded = await firebaseApp.auth().verifyIdToken(idToken);
  return {
    email: decoded.email ?? '',
    name: decoded.name as string | undefined,
    picture: decoded.picture,
    uid: decoded.uid,
    emailVerified: Boolean(decoded.email_verified),
  };
}
