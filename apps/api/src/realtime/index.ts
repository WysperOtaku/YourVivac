import type { Server as HttpServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { corsOrigins } from '../config/env.js';
import { logger } from '../config/logger.js';
import { verifyAccessToken } from '../lib/jwt.js';

let io: SocketServer | null = null;

/**
 * Inicializa Socket.IO sobre el servidor HTTP. Salas por salida (`trip:<id>`)
 * para chat de grupo y colaboración del tablero.
 * Worker (realtime): añade los handlers de eventos (pin:add/move, message:new, etc.).
 */
export function initRealtime(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: { origin: corsOrigins, credentials: true },
  });

  // Auth del socket vía access token en el handshake.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('No autenticado'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug({ userId: socket.data.userId }, 'socket conectado');

    socket.on('trip:join', async (tripId: string) => {
      // Verifica pertenencia antes de unir a la sala del trip.
      try {
        const { TripModel } = await import('../models/trip.model.js');
        const trip = await TripModel.findById(tripId).select('members');
        const isMember = trip?.members.some((m) => String(m.userId) === socket.data.userId);
        if (isMember) {
          socket.join(`trip:${tripId}`);
          socket.emit('trip:joined', { tripId });
        } else {
          socket.emit('trip:denied', { tripId });
        }
      } catch {
        socket.emit('trip:denied', { tripId });
      }
    });

    socket.on('trip:leave', (tripId: string) => socket.leave(`trip:${tripId}`));
  });

  return io;
}

/** Emite un evento a la sala de una salida (lo usan los servicios de board/chat). */
export function emitToTrip(tripId: string, event: string, payload: unknown): void {
  io?.to(`trip:${tripId}`).emit(event, payload);
}

export function getIo(): SocketServer | null {
  return io;
}
