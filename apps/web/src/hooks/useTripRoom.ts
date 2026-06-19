import { useEffect, useRef } from 'react';
import type { Message, Pin } from '@yourvivac/types';
import { getSocket } from '@/lib/socket';

export interface TripRoomHandlers {
  onPinAdd?: (pin: Pin) => void;
  onPinUpdate?: (pin: Pin) => void;
  onPinRemove?: (data: { id: string }) => void;
  onMessageNew?: (msg: Message) => void;
  onMessageDeleted?: (data: { id: string }) => void;
}

/**
 * Une el socket a la sala de la salida y enruta los eventos en vivo
 * (pin:* y message:*). Los handlers se guardan en ref para no resuscribir.
 */
export function useTripRoom(tripId: string | undefined, handlers: TripRoomHandlers): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!tripId) return;
    const socket = getSocket();
    const join = () => socket.emit('trip:join', tripId);
    if (socket.connected) join();
    socket.on('connect', join);

    const onPinAdd = (p: Pin) => ref.current.onPinAdd?.(p);
    const onPinUpdate = (p: Pin) => ref.current.onPinUpdate?.(p);
    const onPinRemove = (d: { id: string }) => ref.current.onPinRemove?.(d);
    const onMessageNew = (m: Message) => ref.current.onMessageNew?.(m);
    const onMessageDeleted = (d: { id: string }) => ref.current.onMessageDeleted?.(d);

    socket.on('pin:add', onPinAdd);
    socket.on('pin:update', onPinUpdate);
    socket.on('pin:remove', onPinRemove);
    socket.on('message:new', onMessageNew);
    socket.on('message:deleted', onMessageDeleted);

    return () => {
      socket.emit('trip:leave', tripId);
      socket.off('connect', join);
      socket.off('pin:add', onPinAdd);
      socket.off('pin:update', onPinUpdate);
      socket.off('pin:remove', onPinRemove);
      socket.off('message:new', onMessageNew);
      socket.off('message:deleted', onMessageDeleted);
    };
  }, [tripId]);
}
