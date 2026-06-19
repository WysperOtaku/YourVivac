import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification, NotificationType } from '@yourvivac/types';
import { Icon } from '@/ui';
import { api } from '@/lib/api';
import { relativeTime } from '@/lib/format';

const LABELS: Partial<Record<NotificationType, string>> = {
  trip_invite: 'te ha invitado a una salida',
  trip_join: 'se ha unido a tu salida',
  new_message: 'nuevo mensaje en el grupo',
  pin_added: 'añadió un pin al tablero',
  tip_like: 'le gustó tu consejo',
  comment: 'comentó tu publicación',
  follow: 'empezó a seguirte',
  guide_approved: '¡tu solicitud de guía fue aprobada!',
  guide_rejected: 'tu solicitud de guía fue rechazada',
  help_request: 'pidió ayuda a un guía',
  mention: 'te ha mencionado',
};

function describe(n: Notification): string {
  return LABELS[n.type] ?? 'Nueva notificación';
}

/** Campana de notificaciones con contador de no leídas y panel desplegable. */
export function NotificationsBell({ size = 22 }: { size?: number }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
    refetchInterval: 60_000,
    retry: false,
  });
  const readAll = useMutation({
    mutationFn: () => api.notifications.readAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = data?.unread ?? 0;
  const items = data?.items ?? [];

  return (
    <div className="relative">
      <button
        className="relative grid place-items-center"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) readAll.mutate();
        }}
        aria-label="Notificaciones"
      >
        <Icon name="bell" size={size} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-terra px-1 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="card absolute right-0 top-9 z-50 max-h-[60vh] w-[300px] overflow-y-auto p-0">
            <div className="eyebrow border-b border-[var(--line)] px-3.5 py-3">Notificaciones</div>
            {items.length === 0 ? (
              <div className="faint px-3.5 py-6 text-center text-sm">Sin notificaciones</div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`row gap10 border-b border-[var(--line)] px-3.5 py-3 ${n.read ? '' : 'bg-bg-3'}`}
                >
                  <span className="mt-1 h-2 w-2 flex-none rounded-full" style={{ background: n.read ? 'transparent' : 'var(--accent)' }} />
                  <div className="grow min-w-0">
                    <div className="text-[13.5px] leading-snug">{describe(n)}</div>
                    <div className="faint mono mt-0.5 text-[10.5px]">{relativeTime(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
