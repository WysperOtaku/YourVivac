import { io, type Socket } from 'socket.io-client';
import { api } from '@/lib/api';

/** Origen del socket = origen del API sin el path `/api/v1`. */
function socketOrigin(): string {
  const url = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
  try {
    return new URL(url).origin;
  } catch {
    return 'http://localhost:4000';
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
