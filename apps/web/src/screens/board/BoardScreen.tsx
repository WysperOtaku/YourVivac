import { useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import type { Pin, PinType } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { ChatPanel } from '@/components/ChatPanel';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { useTripRoom } from '@/hooks/useTripRoom';
import { useAuthStore } from '@/stores/authStore';
import { PinView } from './pins';
import { AddPinModal } from './AddPinModal';

type View = 'free' | 'wall' | 'guided';

const GROUPS: { type: PinType; icon: 'list' | 'image' | 'note' | 'pin' | 'link'; title: string }[] = [
  { type: 'list', icon: 'list', title: 'Equipo' },
  { type: 'photo', icon: 'image', title: 'Fotos' },
  { type: 'note', icon: 'note', title: 'Notas' },
  { type: 'text', icon: 'note', title: 'Avisos' },
  { type: 'map', icon: 'pin', title: 'Mapa' },
  { type: 'link', icon: 'link', title: 'Enlaces' },
];

export function BoardScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [view, setView] = useState<View>('free');
  const [adding, setAdding] = useState(false);

  const tripQ = useQuery({ queryKey: ['trip', id], queryFn: () => api.trips.get(id), retry: false });
  const boardQ = useQuery({ queryKey: ['board', id], queryFn: () => api.board.get(id), retry: false });

  useTripRoom(id, {
    onPinAdd: () => qc.invalidateQueries({ queryKey: ['board', id] }),
    onPinUpdate: () => qc.invalidateQueries({ queryKey: ['board', id] }),
    onPinRemove: () => qc.invalidateQueries({ queryKey: ['board', id] }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['board', id] });
  const updatePinMut = useMutation({
    mutationFn: (v: { pinId: string; layout: { x: number; y: number } }) => api.board.updatePin(v.pinId, { layout: v.layout }),
    onSuccess: invalidate,
  });
  const deletePinMut = useMutation({
    mutationFn: (pinId: string) => api.board.deletePin(pinId),
    onSuccess: invalidate,
    onError: (e) => toast.error(errMsg(e, 'No se pudo borrar')),
  });
  const reactMut = useMutation({
    mutationFn: (v: { pinId: string; emoji: string }) => api.board.react(v.pinId, v.emoji),
    onSuccess: invalidate,
  });

  const trip = tripQ.data;
  const pins = boardQ.data ?? [];
  const members = trip?.memberUsers ?? [];
  const nameOf = (pin: Pin) => members.find((m) => m.id === String(pin.authorId))?.displayName;
  const canEdit = (pin: Pin) => String(pin.authorId) === me?.id || String(trip?.owner) === me?.id;

  const pinProps = (pin: Pin) => ({
    pin,
    authorName: nameOf(pin),
    canEdit: canEdit(pin),
    meId: me?.id,
    onDelete: () => deletePinMut.mutate(pin.id),
    onReact: (emoji: string) => reactMut.mutate({ pinId: pin.id, emoji }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  function onDragEnd(e: DragEndEvent) {
    const { active, delta } = e;
    const pin = pins.find((p) => p.id === String(active.id));
    if (!pin || (delta.x === 0 && delta.y === 0)) return;
    updatePinMut.mutate({ pinId: pin.id, layout: { x: Math.max(0, pin.layout.x + delta.x), y: Math.max(0, pin.layout.y + delta.y) } });
  }

  return (
    <AppShell topbar={{ title: trip?.title ?? 'Tablero', sub: 'Tablero colaborativo' }} bareDesktop>
      {/* Cabecera móvil */}
      <header className="flex-none px-4 pt-1 lg:hidden">
        <div className="spread">
          <div className="row gap10">
            <button onClick={() => navigate(`/salida/${id}`)} aria-label="Volver">
              <Icon name="back" size={26} />
            </button>
            <div>
              <h3 className="text-[18px]">{trip?.title ?? 'Tablero'}</h3>
              <div className="faint mono text-[11px]">{members.length} montañeros</div>
            </div>
          </div>
          <div className="row pr-1">
            {members.slice(0, 4).map((m) => (
              <Avatar key={m.id} name={m.displayName} size={28} ring style={{ marginLeft: -7 }} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex h-full flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Conmutador de vista */}
          <div className="row gap6 flex-none px-4 pt-3 lg:px-7 lg:pt-5">
            <div className="row gap6 rounded-control bg-bg-2 p-1 shadow-[inset_0_0_0_1px_var(--line)]">
              {(['free', 'wall', 'guided'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`mono rounded-[9px] px-3 py-1.5 text-[12.5px] capitalize ${view === v ? 'bg-bg-4 text-ink shadow-sm' : 'text-ink-3'}`}
                >
                  {v === 'free' ? 'Mural' : v === 'wall' ? 'Muro' : 'Guiado'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3 flex-1 overflow-auto">
            {boardQ.isLoading ? (
              <div className="faint p-10 text-center text-sm">Cargando tablero…</div>
            ) : pins.length === 0 ? (
              <div className="grid h-full place-items-center p-10 text-center">
                <div>
                  <p className="muted">El tablero está vacío.</p>
                  <button className="btn mt-3" onClick={() => setAdding(true)}>
                    <Icon name="plus" size={16} /> Añadir el primer pin
                  </button>
                </div>
              </div>
            ) : view === 'free' ? (
              <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <div className="board relative min-h-full" style={{ minHeight: 600 }}>
                  {pins.map((pin) => (
                    <DraggablePin key={pin.id} pin={pin}>
                      <PinView {...pinProps(pin)} />
                    </DraggablePin>
                  ))}
                </div>
              </DndContext>
            ) : view === 'wall' ? (
              <div className="bg-bg p-4">
                <div className="columns-2 gap-3 lg:columns-3">
                  {pins.map((pin) => (
                    <div key={pin.id} className="mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full [&>.pin]:shadow-sm [&_.pin__tack]:hidden">
                      <PinView {...pinProps(pin)} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-bg p-4 lg:px-8">
                <div className="mx-auto max-w-3xl">
                  {GROUPS.map((g) => {
                    const group = pins.filter((p) => p.type === g.type);
                    if (group.length === 0) return null;
                    return (
                      <section key={g.type} className="mb-5">
                        <div className="row gap8 mb-2.5">
                          <Icon name={g.icon} size={18} className="text-accent" />
                          <span className="font-display text-[17px]">{g.title}</span>
                          <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>{group.length}</span>
                        </div>
                        <div className="columns-1 gap-3 sm:columns-2">
                          {group.map((pin) => (
                            <div key={pin.id} className="mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full [&_.pin__tack]:hidden">
                              <PinView {...pinProps(pin)} />
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="btn absolute bottom-5 right-4 rounded-[16px] px-4 py-3 shadow" onClick={() => setAdding(true)}>
              <Icon name="plus" size={18} /> Añadir pin
            </button>
          </div>
        </div>

        {/* Chat (escritorio) */}
        <aside className="hidden w-[330px] flex-none flex-col overflow-hidden bg-bg shadow-[inset_1px_0_0_var(--line)] lg:flex">
          <div className="spread flex-none px-4 py-4 shadow-[inset_0_-1px_0_var(--line)]">
            <h3 className="font-display text-[18px]">Chat del grupo</h3>
            <Icon name="users" size={18} className="text-ink-3" />
          </div>
          {trip && <ChatPanel tripId={id} members={members} className="flex-1" />}
        </aside>
      </div>

      <AddPinModal open={adding} onClose={() => setAdding(false)} tripId={id} />
    </AppShell>
  );
}

function DraggablePin({ pin, children }: { pin: Pin; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pin.id });
  const style: CSSProperties = {
    position: 'absolute',
    left: pin.layout.x,
    top: pin.layout.y,
    width: pin.layout.w,
    zIndex: isDragging ? 9999 : pin.layout.z,
    transform: `${transform ? `translate(${transform.x}px, ${transform.y}px) ` : ''}rotate(${pin.layout.rotation}deg)`,
    touchAction: 'none',
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
