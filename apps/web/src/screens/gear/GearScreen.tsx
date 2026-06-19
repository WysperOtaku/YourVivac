import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { GearItem, GearList, StoreKey } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { ProductSearchModal } from './ProductSearchModal';

const STORE_LABEL: Record<StoreKey, string> = {
  amazon: 'Amazon',
  decathlon: 'Decathlon',
  deporvillage: 'Deporvillage',
  barrabes: 'Barrabés',
  forum: 'Forum',
  coleman: 'Coleman',
};

function ItemRow({ item, last, onToggle }: { item: GearItem; last: boolean; onToggle: () => void }) {
  return (
    <div className={`row gap12 py-2.5 ${last ? '' : 'border-b border-[var(--line)]'}`}>
      <button onClick={onToggle} className={`gear-check ${item.checked ? 'on' : ''}`} style={{ width: 18, height: 18 }} aria-label="marcar" />
      <div className="grow min-w-0">
        <div className={`text-[14px] ${item.checked ? 'line-through opacity-60' : ''}`}>{item.name}</div>
        <div className="row gap8 mt-1">
          {item.product && <span className={`store store--${item.product.storeKey}`}>{STORE_LABEL[item.product.storeKey]}</span>}
          {item.weightGrams != null && <span className="faint mono text-[11px]">{item.weightGrams} g</span>}
        </div>
      </div>
    </div>
  );
}

function ListCard({ list }: { list: GearList }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [searchFor, setSearchFor] = useState<string | null>(null);

  const toggleMut = useMutation({
    mutationFn: (item: GearItem) => api.gear.updateItem(list.id, item.id, { checked: !item.checked }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gear'] }),
  });
  const addMut = useMutation({
    mutationFn: (name: string) => api.gear.addItem(list.id, { name }),
    onSuccess: () => {
      setNewItem('');
      qc.invalidateQueries({ queryKey: ['gear'] });
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo añadir')),
  });

  const kg = (list.totalWeight / 1000).toFixed(1).replace('.', ',');

  return (
    <div className="card p-3.5">
      <button className="row gap12 w-full text-left" onClick={() => setOpen((v) => !v)}>
        <div className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px]" style={{ color: 'var(--accent)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb,var(--accent) 38%,transparent)' }}>
          <Icon name="list" size={22} />
        </div>
        <div className="grow min-w-0">
          <div className="font-display text-[17px]">{list.name}</div>
          <div className="faint mono mt-0.5 text-[11px]">{list.items.length} ítems · {kg} kg</div>
        </div>
        <Icon name={open ? 'chevdown' : 'chevron'} size={18} className="text-ink-3" />
      </button>

      {open && (
        <div className="mt-3 border-t border-[var(--line)] pt-1">
          {list.items.length === 0 ? (
            <div className="faint py-3 text-center text-[13px]">Lista vacía. Añade material abajo.</div>
          ) : (
            list.items.map((it, i) => (
              <ItemRow key={it.id} item={it} last={i === list.items.length - 1} onToggle={() => toggleMut.mutate(it)} />
            ))
          )}

          <form
            className="row gap8 mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (newItem.trim()) addMut.mutate(newItem.trim());
            }}
          >
            <input
              className="grow rounded-control bg-bg-3 px-3 py-2 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
              placeholder="Añadir ítem manual…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <button className="btn px-3 py-2 text-sm" type="submit"><Icon name="plus" size={16} /></button>
          </form>
          <button className="btn btn--ghost btn--block mt-2 py-2 text-sm" onClick={() => setSearchFor(list.id)}>
            <Icon name="search" size={16} /> Buscar en tiendas
          </button>
        </div>
      )}

      <ProductSearchModal open={searchFor === list.id} onClose={() => setSearchFor(null)} listId={list.id} />
    </div>
  );
}

export function GearScreen() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['gear'], queryFn: () => api.gear.list(), retry: false });
  const lists = data ?? [];

  const createMut = useMutation({
    mutationFn: () => api.gear.create({ name: name.trim() }),
    onSuccess: () => {
      setName('');
      setCreating(false);
      qc.invalidateQueries({ queryKey: ['gear'] });
      toast.success('Lista creada');
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo crear la lista')),
  });

  return (
    <AppShell topbar={{ title: 'Mi equipo', sub: 'Material' }}>
      <div className="mx-auto w-full max-w-4xl px-[18px] lg:px-7 lg:pt-4">
        <div className="flex-none pb-1.5 lg:hidden">
          <h1 className="text-[26px]">Mi equipo</h1>
          <p className="muted mt-0.5 text-sm">Tus listas reutilizables y material guardado.</p>
        </div>

        <div className="spread mb-2.5 mt-2">
          <span className="eyebrow">Mis listas</span>
          <button className="accent row gap4 mono text-[12.5px]" onClick={() => setCreating((v) => !v)}>
            <Icon name="plus" size={13} /> Nueva lista
          </button>
        </div>

        {creating && (
          <form
            className="card row gap8 mb-3 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) createMut.mutate();
            }}
          >
            <input
              autoFocus
              className="grow rounded-control bg-bg-3 px-3 py-2 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
              placeholder="Nombre de la lista (p.ej. Vivac de verano)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="btn px-4" type="submit" disabled={!name.trim() || createMut.isPending}>Crear</button>
          </form>
        )}

        {isLoading ? (
          <div className="faint py-10 text-center text-sm">Cargando listas…</div>
        ) : lists.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="muted">No tienes listas de equipo todavía.</p>
            <button className="btn mt-3" onClick={() => setCreating(true)}><Icon name="plus" size={16} /> Crear lista</button>
          </div>
        ) : (
          <div className="stack gap10 lg:grid lg:grid-cols-2 lg:gap-3 lg:[&>*]:m-0">
            {lists.map((l) => (
              <ListCard key={l.id} list={l} />
            ))}
          </div>
        )}

        <div className="card mb-6 mt-4 bg-bg-3 p-4">
          <div className="row gap8">
            <Icon name="search" size={18} className="text-accent" />
            <strong className="text-[14.5px]">Buscar material en tiendas</strong>
          </div>
          <p className="faint mt-1.5 text-[12.5px]">
            Un solo buscador para Amazon, Decathlon, Deporvillage, Barrabés, Forum y Coleman. Abre una lista y pulsa “Buscar en tiendas”.
          </p>
          <div className="row gap6 flex-wrap mt-2.5">
            {(Object.keys(STORE_LABEL) as StoreKey[]).map((k) => (
              <span key={k} className={`store store--${k}`}>{STORE_LABEL[k]}</span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
