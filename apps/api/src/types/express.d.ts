import type { UserRole } from '@yourvivac/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Poblado por `authGuard` tras verificar el access token. */
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
