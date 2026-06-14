import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AuthResponse, RegisterRequest, LoginRequest, User } from '@yourvivac/types';
import { slugify } from '@yourvivac/utils';
import { UserModel } from '../../models/user.model.js';
import { SessionModel } from '../../models/ops.model.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { verifyGoogleIdToken } from '../../lib/firebase.js';
import { sendMail } from '../../lib/mailer.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../middleware/error.js';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Serializa el documento de usuario quitando campos sensibles. */
function toUser(doc: { toObject: () => Record<string, unknown> }): User {
  const obj = doc.toObject();
  delete obj.passwordHash;
  obj.id = String(obj._id);
  delete obj._id;
  delete obj.__v;
  return obj as unknown as User;
}

async function uniqueUsername(base: string): Promise<string> {
  const root = slugify(base).replace(/-/g, '') || 'vivac';
  let candidate = root.slice(0, 24);
  let n = 0;
  // eslint-disable-next-line no-await-in-loop
  while (await UserModel.exists({ username: candidate })) {
    n += 1;
    candidate = `${root.slice(0, 20)}${n}`;
  }
  return candidate;
}

/** Crea una sesión de refresh persistida y devuelve el token firmado. */
async function issueSession(userId: string, device?: string): Promise<string> {
  const session = await SessionModel.create({
    userId,
    tokenHash: 'pending',
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    device,
  });
  const refreshToken = signRefreshToken({ userId, sessionId: String(session._id) });
  session.tokenHash = hashToken(refreshToken);
  await session.save();
  return refreshToken;
}

export interface AuthResult extends AuthResponse {
  refreshToken: string;
  created: boolean;
}

export const authService = {
  async google(idToken: string): Promise<AuthResult> {
    const identity = await verifyGoogleIdToken(idToken);
    if (!identity.email) throw HttpError.unauthorized('El token de Google no incluye email');

    let user = await UserModel.findOne({ email: identity.email });
    let created = false;
    if (!user) {
      user = await UserModel.create({
        displayName: identity.name ?? identity.email.split('@')[0],
        username: await uniqueUsername(identity.name ?? identity.email.split('@')[0] ?? 'vivac'),
        email: identity.email,
        emailVerified: true,
        avatar: identity.picture ? { url: identity.picture, publicId: '' } : undefined,
        authProviders: [{ provider: 'google', providerId: identity.uid, linkedAt: new Date() }],
      });
      created = true;
    } else {
      if (user.status === 'banned') throw HttpError.forbidden('Cuenta suspendida');
      // Enlaza el proveedor Google si la cuenta existía con password.
      if (!user.authProviders.some((p) => p.provider === 'google')) {
        user.authProviders.push({ provider: 'google', providerId: identity.uid, linkedAt: new Date() });
        await user.save();
      }
    }

    const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
    const refreshToken = await issueSession(String(user._id));
    return { user: toUser(user), accessToken, refreshToken, created };
  },

  async register(input: RegisterRequest): Promise<AuthResult> {
    const exists = await UserModel.findOne({ $or: [{ email: input.email }, { username: input.username }] });
    if (exists) throw HttpError.conflict('Email o usuario ya en uso');

    const passwordHash = await hashPassword(input.password);
    const user = await UserModel.create({
      displayName: input.displayName,
      username: input.username,
      email: input.email,
      passwordHash,
      emailVerified: false,
      authProviders: [{ provider: 'password', linkedAt: new Date() }],
    });

    const verifyToken = jwt.sign({ userId: String(user._id), purpose: 'verify-email' }, env.JWT_ACCESS_SECRET, {
      expiresIn: '1d',
    });
    await sendMail({
      to: user.email,
      subject: 'Verifica tu cuenta de YourVivac',
      html: `<p>Hola ${user.displayName}, confirma tu email con este token: <code>${verifyToken}</code></p>`,
    });

    const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
    const refreshToken = await issueSession(String(user._id));
    return { user: toUser(user), accessToken, refreshToken, created: true };
  },

  async login(input: LoginRequest): Promise<AuthResult> {
    const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
    if (!user || !user.passwordHash) throw HttpError.unauthorized('Credenciales inválidas');
    if (user.status === 'banned') throw HttpError.forbidden('Cuenta suspendida');
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw HttpError.unauthorized('Credenciales inválidas');

    const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
    const refreshToken = await issueSession(String(user._id));
    return { user: toUser(user), accessToken, refreshToken, created: false };
  },

  async refresh(token: string | undefined): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) throw HttpError.unauthorized('Falta el refresh token');
    let payload: { userId: string; sessionId: string };
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw HttpError.unauthorized('Refresh token inválido');
    }
    const session = await SessionModel.findById(payload.sessionId);
    if (!session || session.revokedAt || session.tokenHash !== hashToken(token)) {
      throw HttpError.unauthorized('Sesión no válida');
    }
    if (session.expiresAt.getTime() < Date.now()) throw HttpError.unauthorized('Sesión expirada');

    const user = await UserModel.findById(payload.userId);
    if (!user || user.status === 'banned') throw HttpError.unauthorized('Usuario no válido');

    // Rotación: revoca la sesión actual y emite una nueva.
    session.revokedAt = new Date();
    await session.save();
    const accessToken = signAccessToken({ userId: String(user._id), role: user.role });
    const refreshToken = await issueSession(String(user._id), session.device ?? undefined);
    return { accessToken, refreshToken };
  },

  async logout(token: string | undefined): Promise<void> {
    if (!token) return;
    try {
      const payload = verifyRefreshToken(token);
      await SessionModel.updateOne({ _id: payload.sessionId }, { revokedAt: new Date() });
    } catch {
      /* token inválido: nada que revocar */
    }
  },

  async verifyEmail(token: string): Promise<void> {
    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as typeof payload;
    } catch {
      throw HttpError.badRequest('Token de verificación inválido');
    }
    if (payload.purpose !== 'verify-email') throw HttpError.badRequest('Token incorrecto');
    await UserModel.updateOne({ _id: payload.userId }, { emailVerified: true });
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    // No revelamos si el email existe.
    if (!user) return;
    const resetToken = jwt.sign({ userId: String(user._id), purpose: 'reset-password' }, env.JWT_ACCESS_SECRET, {
      expiresIn: '1h',
    });
    await sendMail({
      to: email,
      subject: 'Restablece tu contraseña de YourVivac',
      html: `<p>Usa este token para restablecer tu contraseña: <code>${resetToken}</code></p>`,
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    let payload: { userId: string; purpose: string };
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as typeof payload;
    } catch {
      throw HttpError.badRequest('Token de reset inválido o expirado');
    }
    if (payload.purpose !== 'reset-password') throw HttpError.badRequest('Token incorrecto');
    const passwordHash = await hashPassword(password);
    await UserModel.updateOne({ _id: payload.userId }, { passwordHash });
    // Revoca todas las sesiones activas tras el cambio.
    await SessionModel.updateMany({ userId: payload.userId, revokedAt: null }, { revokedAt: new Date() });
  },

  async me(userId: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) throw HttpError.notFound('Usuario no encontrado');
    return toUser(user);
  },
};
