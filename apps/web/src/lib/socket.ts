import { io, type Socket } from 'socket.io-client';
import { api } from '@/lib/api';

/** Origen del socket = origen del API sin el path `/api/v1`. Si VITE_API_URL es
 *  relativo (o falta), usamos el mismo origen de la web (el proxy reenvía /socket.io). */
function socketOrigin(): string {
  const url = import.meta.env.VITE_API_URL ?? '/api/v1';
  try {
    return new URL(url).origin;
  } catch {
    return window.location.origin;
  }
}

let socket: Socket | null = null;

/** Socket singleton autenticado con el access token (se reevalúa al reconectar). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketOrigin(), {
      transports: ['websocket'],
      auth: (cb) => cb({ token: api.tokenStore.getAccessToken() ?? '' }),
    });
  }
  return socket;
}
