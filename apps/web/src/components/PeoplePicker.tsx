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

/** Normaliza lo tecleado/pegado: «@handle» o URL de perfil (/u/<handle> o …/<handle>)
 *  → handle suelto para usarlo como término de búsqueda. */
function extractTerm(raw: string): string {
  let v = raw.trim();
  if (!v) return '';
  // URL de perfil (absoluta o relativa): toma el último segmento de la ruta.
  if (v.includes('/')) {
    const path = v.split(/[?#]/)[0] ?? v; // descarta query/hash
    const segs = path.split('/').filter(Boolean);
    v = segs[segs.length - 1] ?? '';
  }
  return v.replace(/^@+/, ''); // «@handle» → «handle»
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

  // Término real de búsqueda (resuelve @handle y URLs pegadas).
  const term = extractTerm(debounced);
  const isSearching = term.length >= 2;

  const searchQ = useQuery({
    queryKey: ['user-search', term],
    queryFn: () => api.users.search(term),
    enabled: isSearching,
    retry: false,
  });

  // Sin búsqueda activa: personas sugeridas (a quién sigues / co-miembros).
  const suggestQ = useQuery({
    queryKey: ['user-suggestions'],
    queryFn: () => api.users.suggestions(),
    enabled: !isSearching,
    retry: false,
  });

  const excluded = new Set(excludeIds);
  const selectedIds = new Set(selected.map((u) => u.id));
  // Con búsqueda: resultados; sin búsqueda: sugerencias. Nunca te incluyas a ti.
  const rows = (isSearching ? searchQ.data ?? [] : suggestQ.data ?? []).filter((u) => u.id !== meId);

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
            placeholder="Busca amigos o pega un enlace…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {selected.length > 0 && (
          <span className="accent mono flex-none pl-3 text-[12.5px]">{selected.length} seleccionados</span>
        )}
      </div>

      <div className="stack max-h-[44vh] overflow-auto">
        {isSearching && searchQ.isLoading && (
          <div className="faint py-6 text-center text-sm">Buscando…</div>
        )}
        {isSearching && !searchQ.isLoading && rows.length === 0 && (
          <div className="faint py-6 text-center text-sm">Nadie con «{term}».</div>
        )}
        {!isSearching && suggestQ.isLoading && (
          <div className="faint py-6 text-center text-sm">Cargando sugerencias…</div>
        )}
        {!isSearching && !suggestQ.isLoading && rows.length === 0 && (
          <div className="faint py-6 text-center text-sm">Busca amigos o pega un enlace…</div>
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
