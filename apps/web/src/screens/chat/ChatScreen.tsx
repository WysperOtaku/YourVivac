import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { ChatPanel } from '@/components/ChatPanel';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';

export function ChatScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: trip } = useQuery({ queryKey: ['trip', id], queryFn: () => api.trips.get(id), retry: false });
  const members = trip?.memberUsers ?? [];

  return (
    <AppShell topbar={{ title: trip?.title ?? 'Chat', sub: 'Chat del grupo' }} bareDesktop>
      <div className="flex h-full flex-col">
        <header className="spread flex-none px-4 pb-2 pt-2 shadow-[inset_0_-1px_0_var(--line)] lg:px-7">
          <div className="row gap10">
            <button onClick={() => navigate(`/salida/${id}`)} aria-label="Volver">
              <Icon name="back" size={26} />
            </button>
            <div>
              <h3 className="text-[18px]">{trip?.title ?? 'Chat del grupo'}</h3>
              <div className="faint mono text-[11px]">{members.length} montañeros</div>
            </div>
          </div>
          <div className="row pr-1">
            {members.slice(0, 5).map((m) => (
              <Avatar key={m.id} name={m.displayName} size={28} ring style={{ marginLeft: -7 }} />
            ))}
          </div>
        </header>
        <ChatPanel tripId={id} members={members} className="mx-auto w-full max-w-3xl flex-1" />
      </div>
    </AppShell>
  );
}
