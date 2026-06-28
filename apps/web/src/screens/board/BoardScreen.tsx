import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSwappingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import type { Pin, PinType } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { ChatPanel } from '@/components/ChatPanel';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { fmtDateShort } from '@/lib/format';
import { useTripRoom } from '@/hooks/useTripRoom';
import { useAuthStore } from '@/stores/authStore';
import { InviteMembersModal } from '@/components/InviteMembersModal';
import { EditTripModal } from '@/components/EditTripModal';
import { PinView } from './pins';
import { AddPinModal } from './AddPinModal';

type View = 'mural' | 'wall' | 'guided';

const GROUPS: { type: PinType; icon: 'list' | 'image' | 'note' | 'pin' | 'link' | 'mountain' | 'route'; title: string }[] = [
  { type: 'list', icon: 'list', title: 'Equipo' },
  { type: 'photo', icon: 'image', title: 'Fotos y enlaces' },
  { type: 'link', icon: 'link', title: 'Enlaces' },
  { type: 'note', icon: 'note', title: 'Notas' },
  { type: 'text', icon: 'note', title: 'Avisos' },
  { type: 'map', icon: 'pin', title: 'Mapa' },
  { type: 'topo', icon: 'mountain', title: 'Mapas topo' },
  { type: 'route', icon: 'route', title: 'Rutas' },
];

function useIsDesktop() {
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)');
    const h = () => setD(m.matches);
    m.addEventListener('change', h);
    return () => m.removeEventListener('change', h);
  }, []);
  return d;
}

export function BoardScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<View>('mural');
  const [adding, setAdding] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPin, setEditPin] = useState<Pin | null>(null);
  const [droppedId, setDroppedId] = useState<string | null>(null);

  const tripQ = useQuery({ queryKey: ['trip', id], queryFn: () => api.trips.get(id), retry: false });
  const boardQ = useQuery({ queryKey: ['board', id], queryFn: () => api.board.get(id), retry: false });

  useTripRoom(id, {
    onPinAdd: () => qc.invalidateQueries({ queryKey: ['board', id] }),
    onPinUpdate: () => qc.invalidateQueries({ queryKey: ['board', id] }),
    onPinRemove: () => qc.invalidateQueries({ queryKey: ['board', id] }),
  });

  const setBoard = (updater: (p: Pin[]) => Pin[]) =>
    qc.setQueryData<Pin[]>(['board', id], (prev) => (prev ? updater(prev) : prev));
  const invalidate = () => qc.invalidateQueries({ queryKey: ['board', id] });

  const moveMut = useMutation({
    mutationFn: (v: { pinId: string; layout: { x: number; y: number } }) => api.board.updatePin(v.pinId, { layout: v.layout }),
    onError: (e) => { invalidate(); toast.error(errMsg(e, 'No se pudo mover')); },
  });
  const swapMut = useMutation({
    mutationFn: (v: { a: Pin; b: Pin }) =>
      Promise.all([
        api.board.updatePin(v.a.id, { layout: { z: v.b.layout.z } }),
        api.board.updatePin(v.b.id, { layout: { z: v.a.layout.z } }),
      ]),
    onError: (e) => { invalidate(); toast.error(errMsg(e, 'No se pudo reordenar')); },
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
  const ordered = [...pins].sort((a, b) => a.layout.z - b.layout.z);
  const members = trip?.memberUsers ?? [];
  const isOwner = String(trip?.owner ?? '') === me?.id;
  const nameOf = (pin: Pin) => members.find((m) => m.id === String(pin.authorId))?.displayName;
  const canEdit = (pin: Pin) => String(pin.authorId) === me?.id || String(trip?.owner) === me?.id;
  const pinProps = (pin: Pin) => ({
    pin,
    authorName: nameOf(pin),
    canEdit: canEdit(pin),
    meId: me?.id,
    onDelete: () => deletePinMut.mutate(pin.id),
    onEdit: () => setEditPin(pin),
    onReact: (emoji: string) => reactMut.mutate({ pinId: pin.id, emoji }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Mural libre (escritorio): mueve por x/y con actualización optimista (sin teletransporte).
  function onFreeDragEnd(e: DragEndEvent) {
    const { active, delta } = e;
    const pin = pins.find((p) => p.id === String(active.id));
    if (!pin || (delta.x === 0 && delta.y === 0)) return;
    const layout = { x: Math.max(0, Math.round(pin.layout.x + delta.x)), y: Math.max(0, Math.round(pin.layout.y + delta.y)) };
    setBoard((prev) => prev.map((p) => (p.id === pin.id ? ({ ...p, layout: { ...p.layout, ...layout } } as Pin) : p)));
    setDroppedId(pin.id);
    setTimeout(() => setDroppedId((d) => (d === pin.id ? null : d)), 320);
    moveMut.mutate({ pinId: pin.id, layout });
  }

  // Mural masonry (móvil): intercambia dos pines (swap) y persiste el orden.
  function onSwapEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const a = pins.find((p) => p.id === String(active.id));
    const b = pins.find((p) => p.id === String(over.id));
    if (!a || !b) return;
    setBoard((prev) =>
      prev.map((p) =>
        p.id === a.id ? ({ ...p, layout: { ...p.layout, z: b.layout.z } } as Pin)
        : p.id === b.id ? ({ ...p, layout: { ...p.layout, z: a.layout.z } } as Pin)
        : p,
      ),
    );
    swapMut.mutate({ a, b });
  }

  const addBtn = (
    <button className="btn" onClick={() => setAdding(true)}>
      <Icon name="plus" size={18} /> Añadir pin
    </button>
  );

  // Pila de avatares de miembros + acción de invitar (y editar si eres propietario).
  const memberStack = (size: number) => (
    <button className="row pr-1" onClick={() => setInviteOpen(true)} aria-label="Miembros e invitar">
      {members.slice(0, 5).map((m) => (
        <Avatar key={m.id} name={m.displayName} size={size} src={m.avatar?.url} ring me={m.id === me?.id} style={{ marginLeft: -7 }} className="overflow-hidden" />
      ))}
      <span className="grid flex-none place-items-center rounded-full bg-bg-3 text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)]" style={{ width: size, height: size, marginLeft: -7 }}>
        <Icon name="plus" size={size * 0.5} />
      </span>
    </button>
  );
  const editBtn = isOwner ? (
    <button className="text-ink-3" onClick={() => setEditOpen(true)} aria-label="Editar salida">
      <Icon name="edit" size={19} />
    </button>
  ) : null;

  const emptyOrLoading = boardQ.isLoading ? (
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
  ) : null;

  // --- vistas ---
  const freeMural = (
    <DndContext sensors={sensors} onDragEnd={onFreeDragEnd}>
      <div className="cork absolute inset-0 overflow-auto">
        <div className="relative" style={{ minHeight: '100%', minWidth: '100%' }}>
          {ordered.map((pin) => (
            <FreePin key={pin.id} pin={pin} dropped={droppedId === pin.id}>
              <PinView {...pinProps(pin)} />
            </FreePin>
          ))}
        </div>
      </div>
    </DndContext>
  );

  const muralMasonry = (
    <div className="cork min-h-full p-3">
      <DndContext sensors={sensors} onDragEnd={onSwapEnd}>
        <SortableContext items={ordered.map((p) => p.id)} strategy={rectSwappingStrategy}>
          <div className="columns-2 gap-3">
            {ordered.map((pin) => (
              <SwapPin key={pin.id} pin={pin}>
                <PinView {...pinProps(pin)} />
              </SwapPin>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

  const wallMasonry = (
    <div className="min-h-full bg-bg p-4">
      <div className="spread mb-3">
        <span className="eyebrow">{pins.length} pines · ordenado</span>
        <span className="row gap8 text-ink-3">
          <Icon name="grid" size={16} />
          <Icon name="filter" size={16} />
        </span>
      </div>
      <div className="columns-2 gap-3">
        {ordered.map((pin) => (
          <div key={pin.id} className="mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full [&>.pin]:shadow-sm">
            <PinView {...pinProps(pin)} flat />
          </div>
        ))}
      </div>
    </div>
  );

  const guided = (
    <div className="min-h-full bg-bg p-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {GROUPS.map((g) => {
          const group = ordered.filter((p) => p.type === g.type);
          if (group.length === 0) return null;
          return (
            <section key={g.type} className="mb-6">
              <div className="row gap8 mb-2.5">
                <Icon name={g.icon} size={18} className="text-accent" />
                <span className="font-display text-[19px]">{g.title}</span>
                <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>{group.length}</span>
              </div>
              <div className="columns-1 gap-3 sm:columns-2">
                {group.map((pin) => (
                  <div key={pin.id} className="mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full">
                    <PinView {...pinProps(pin)} flat />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  // ---- ESCRITORIO ----
  if (isDesktop) {
    const sub = trip ? `${fmtDateShort(trip.startDate)}–${fmtDateShort(trip.endDate)} · ${trip.location?.name ?? ''}` : '';
    return (
      <AppShell
        topbar={{
          title: trip?.title ?? 'Tablero',
          sub,
          actions: (
            <div className="row gap14">
              {memberStack(32)}
              {editBtn}
              {addBtn}
            </div>
          ),
        }}
      >
        <div className="flex h-full">
          <div className="relative flex-1 overflow-hidden">{emptyOrLoading ?? freeMural}</div>
          <aside className="hidden w-[330px] flex-none flex-col overflow-hidden bg-bg shadow-[inset_1px_0_0_var(--line)] lg:flex">
            <div className="spread flex-none px-4 py-4 shadow-[inset_0_-1px_0_var(--line)]">
              <h3 className="font-display text-[18px]">Chat del grupo</h3>
              <Icon name="users" size={18} className="text-ink-3" />
            </div>
            {trip && <ChatPanel tripId={id} members={members} className="flex-1" />}
          </aside>
        </div>
        <AddPinModal
          open={adding || !!editPin}
          onClose={() => {
            setAdding(false);
            setEditPin(null);
          }}
          tripId={id}
          editPin={editPin}
        />
        <InviteMembersModal open={inviteOpen} onClose={() => setInviteOpen(false)} tripId={id} existingIds={members.map((m) => m.id)} />
        {trip && isOwner && <EditTripModal open={editOpen} onClose={() => setEditOpen(false)} trip={trip} />}
      </AppShell>
    );
  }

  // ---- MÓVIL ----
  return (
    <AppShell topbar={{ title: trip?.title ?? 'Tablero', sub: '' }} bareDesktop>
      <header className="flex-none px-4 pt-1">
        <div className="spread">
          <div className="row gap10">
            <button onClick={() => navigate(`/salida/${id}`)} aria-label="Volver">
              <Icon name="back" size={26} />
            </button>
            <div>
              <h3 className="text-[18px]">{trip?.title ?? 'Tablero'}</h3>
              <div className="faint mono text-[11px]">
                {trip ? `${fmtDateShort(trip.startDate)}–${fmtDateShort(trip.endDate)} · ` : ''}
                {members.length} montañeros
              </div>
            </div>
          </div>
          <div className="row gap10">
            {editBtn}
            {memberStack(28)}
          </div>
        </div>
      </header>

      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="row gap6 flex-none px-4 pt-3">
          <div className="row gap6 rounded-control bg-bg-2 p-1 shadow-[inset_0_0_0_1px_var(--line)]">
            {(['mural', 'wall', 'guided'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`mono rounded-[9px] px-3 py-1.5 text-[12.5px] ${view === v ? 'bg-bg-4 text-ink shadow-sm' : 'text-ink-3'}`}
              >
                {v === 'mural' ? 'Tablero' : v === 'wall' ? 'Muro' : 'Guiado'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-3 flex-1 overflow-auto">
          {emptyOrLoading ?? (view === 'mural' ? muralMasonry : view === 'wall' ? wallMasonry : guided)}
        </div>

        <button className="btn absolute bottom-5 right-4 rounded-[16px] px-4 py-3 shadow" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} /> Añadir pin
        </button>
      </div>

      <AddPinModal open={adding} onClose={() => setAdding(false)} tripId={id} />
      <InviteMembersModal open={inviteOpen} onClose={() => setInviteOpen(false)} tripId={id} existingIds={members.map((m) => m.id)} />
      {trip && isOwner && <EditTripModal open={editOpen} onClose={() => setEditOpen(false)} trip={trip} />}
    </AppShell>
  );
}

/** Pin libre arrastrable (mural escritorio) con animación orgánica y sin teletransporte. */
function FreePin({ pin, dropped, children }: { pin: Pin; dropped: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pin.id });
  const style: CSSProperties = {
    position: 'absolute',
    left: pin.layout.x,
    top: pin.layout.y,
    width: pin.layout.w,
    zIndex: isDragging ? 9999 : pin.layout.z,
    rotate: `${pin.layout.rotation}deg`,
    translate: transform ? `${transform.x}px ${transform.y}px` : undefined,
    touchAction: 'none',
    cursor: 'grab',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pin-free ${isDragging ? 'is-dragging' : ''} ${dropped ? 'is-dropped' : ''}`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

/** Pin intercambiable en el masonry del mural (móvil). */
function SwapPin({ pin, children }: { pin: Pin; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pin.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    touchAction: 'none',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="pin-postit mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full"
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
