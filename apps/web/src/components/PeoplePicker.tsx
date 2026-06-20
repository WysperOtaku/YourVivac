import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserSearchResult } from '@yourvivac/types';
import { Avatar, Icon } from '@/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  selected: UserSearchResult[];
  onChange: (next: UserSearchResult[]) => void;
  /** Ids que ya son miembros: se muestran como «ya en la salida», no seleccionables. */
  excludeIds?: string[];
  autoFocus?: boolean;
}

/** Buscador de personas para invitar: busca por nombre/@usuario y marca con + / ✓.
 *  Reutilizable en crear salida y en la modal de invitar miembros. */
export function PeoplePicker({ selected, onChange, excludeIds = [], autoFocus }: Props) {
  const meId = useAuthStore((s) => s.user?.id);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const searchQ = useQuery({
    queryKey: ['user-search', debounced],
    queryFn: () => api.users.search(debounced),
    enabled: debounced.length >= 2,
    retry: false,
  });

  const excluded = new Set(excludeIds);
  const selectedIds = new Set(selected.map((u) => u.id));
  // Con búsqueda: resultados (sin contarte a ti); sin búsqueda: lo ya seleccionado.
  const rows = debounced.length >= 2 ? (searchQ.data ?? []).filter((u) => u.id !== meId) : selected;

  const toggle = (u: UserSearchResult) => {
    if (excluded.has(u.id)) return;
    if (selectedIds.has(u.id)) onChange(selected.filter((s) => s.id !== u.id));
    else onChange([...selected, u]);
  };

  return (
    <div className="stack gap10">
      <div className="spread">
        <div className="row gap10 grow rounded-control bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)] focus-within:shadow-[inset_0_0_0_1.5px_var(--accent)]">
          <Icon name="search" size={17} className="text-ink-3" />
          <input
            autoFocus={autoFocus}
            className="grow bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-3"
            placeholder="Busca amigos por nombre o @usuario…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {selected.length > 0 && (
          <span className="accent mono flex-none pl-3 text-[12.5px]">{selected.length} seleccionados</span>
        )}
      </div>

      <div className="stack max-h-[44vh] overflow-auto">
        {debounced.length >= 2 && searchQ.isLoading && (
          <div className="faint py-6 text-center text-sm">Buscando…</div>
        )}
        {debounced.length >= 2 && !searchQ.isLoading && rows.length === 0 && (
          <div className="faint py-6 text-center text-sm">Nadie con «{debounced}».</div>
        )}
        {debounced.length < 2 && selected.length === 0 && (
          <div className="faint py-6 text-center text-sm">Busca a tu gente por nombre o @usuario.</div>
        )}

        {rows.map((u) => {
          const isExcluded = excluded.has(u.id);
          const isSelected = selectedIds.has(u.id);
          return (
            <button
              key={u.id}
              type="button"
              disabled={isExcluded}
              onClick={() => toggle(u)}
              className="row gap12 w-full py-2.5 text-left disabled:opacity-60"
            >
              <Avatar name={u.displayName} size={40} src={u.avatar?.url} className="overflow-hidden" />
              <div className="grow min-w-0">
                <div className="row gap6 text-[15px]">
                  <span className="truncate">{u.displayName}</span>
                  {u.role === 'guide' && <Icon name="shield" size={13} className="text-terra" />}
                </div>
                <div className="faint mono text-[11.5px]">
                  {isExcluded ? 'Ya en la salida' : isSelected ? 'se apunta' : `@${u.username}`}
                </div>
              </div>
              <span
                className={`grid h-7 w-7 flex-none place-items-center rounded-[9px] ${
                  isSelected || isExcluded
                    ? 'bg-accent text-accent-ink'
                    : 'text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)]'
                }`}
              >
                <Icon name={isSelected || isExcluded ? 'check' : 'plus'} size={16} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
