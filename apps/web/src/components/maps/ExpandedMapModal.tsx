import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TopoMark } from '@yourvivac/types';
import type { LatLng } from '@/lib/maps';
import { Icon } from '@/ui';
import { TopoMapLibre } from './TopoMapLibre';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  center: LatLng;
  zoom?: number;
  layer?: 'base' | 'mtn' | 'relieve' | 'ortofoto';
  marks?: TopoMark[];
  route?: LatLng[];
  /** Pie opcional (p. ej. chips de distancia/desnivel de una ruta). */
  footer?: ReactNode;
}

/**
 * Visor de mapa a pantalla completa e INTERACTIVO. En móvil ocupa toda la
 * pantalla; en escritorio es un panel grande centrado. Resuelve que el pin de
 * mapa, una vez creado, no se pudiera explorar (pan/zoom).
 */
export function ExpandedMapModal({ open, onClose, title, center, zoom, layer, marks, route, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // evita scroll del fondo
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col sm:p-4">
      <div className="absolute inset-0 hidden bg-black/60 sm:block" onClick={onClose} />
      <div className="relative z-10 mx-auto flex h-full w-full flex-col overflow-hidden bg-bg-2 sm:max-w-5xl sm:rounded-card sm:shadow">
        <header className="row gap10 flex-none px-4 py-3 shadow-[inset_0_-1px_0_var(--line)]">
          <Icon name="mountain" size={16} className="text-accent" />
          <h3 className="grow truncate text-base">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-2 hover:bg-bg-4"
          >
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="relative grow">
          <TopoMapLibre
            center={center}
            zoom={zoom}
            layer={layer}
            marks={marks}
            route={route}
            interactive
            className="absolute inset-0"
          />
        </div>
        {footer && (
          <div className="flex-none px-4 py-3 shadow-[inset_0_1px_0_var(--line)]">{footer}</div>
        )}
      </div>
    </div>
  );
}
