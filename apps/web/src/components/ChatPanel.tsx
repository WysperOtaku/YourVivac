import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PublicUser } from '@yourvivac/types';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useTripRoom } from '@/hooks/useTripRoom';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  tripId: string;
  members?: PublicUser[];
  className?: string;
}

/** Chat de grupo en tiempo real (REST + socket). Reutilizado en chat y tablero. */
export function ChatPanel({ tripId, members = [], className }: Props) {
  const me = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const byId = new Map(members.map((m) => [m.id, m]));

  const { data, isLoading } = useQuery({
    queryKey: ['messages', tripId],
    queryFn: () => api.chat.history(tripId, { pageSize: 50 }),
    retry: false,
  });

  useTripRoom(tripId, {
    onMessageNew: () => qc.invalidateQueries({ queryKey: ['messages', tripId] }),
    onMessageDeleted: () => qc.invalidateQueries({ queryKey: ['messages', tripId] }),
  });

  const sendMut = useMutation({
    mutationFn: (body: string) => api.chat.send(tripId, { body }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['messages', tripId] });
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo enviar')),
  });

  const messages = data?.items ?? [];
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="grow overflow-y-auto p-4">
        {isLoading ? (
          <div className="faint py-6 text-center text-sm">Cargando chat…</div>
        ) : messages.length === 0 ? (
          <div className="faint py-6 text-center text-sm">Aún no hay mensajes. ¡Saluda al grupo!</div>
        ) : (
          messages.map((m) => {
            const mine = m.authorId === me?.id;
            const author = m.authorId ? byId.get(String(m.authorId)) : undefined;
            return mine ? (
              <div key={m.id} className="row justify-end mb-3">
                <div className="max-w-[80%] rounded-2xl rounded-br-[5px] bg-accent px-3 py-2 text-sm text-accent-ink">
                  {m.body}
                </div>
              </div>
            ) : (
              <div key={m.id} className="row gap8 mb-3 items-end">
                <Avatar name={author?.displayName ?? '?'} size={26} />
                <div className="max-w-[80%]">
                  <div className="faint mono mb-0.5 text-[10px]">{author?.displayName ?? 'Miembro'}</div>
                  <div className="rounded-2xl rounded-bl-[5px] bg-bg-3 px-3 py-2 text-sm shadow-[inset_0_0_0_1px_var(--line)]">
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        className="row gap8 flex-none px-3.5 py-3 shadow-[inset_0_1px_0_var(--line)]"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) sendMut.mutate(text.trim());
        }}
      >
        <input
          className="grow rounded-2xl bg-bg-3 px-3.5 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          placeholder="Mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="grid h-[38px] w-[38px] flex-none place-items-center rounded-control bg-accent text-accent-ink disabled:opacity-50"
          disabled={!text.trim() || sendMut.isPending}
          aria-label="Enviar"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
