import type { TopoMark } from '@yourvivac/types';
import type { LatLng } from '@/lib/maps';

export interface TopoMapLibreProps {
  /** Centro del mapa. */
  center: LatLng;
  zoom?: number;
  /** Capa base IGN. */
  layer?: 'base' | 'mtn' | 'relieve' | 'ortofoto';
  /** Marcas/iconos YourVivac (cumbre, refugio, fuente, vivac…). */
  marks?: TopoMark[];
  /** Polilínea de ruta (pin `route`). */
  route?: LatLng[];
  className?: string;
  /** Mapa interactivo (true) o solo lectura compacto (false). */
  interactive?: boolean;
  /** Click en el mapa → coordenadas (para colocar marcas o waypoints). */
  onClick?: (coords: LatLng) => void;
}

/**
 * STUB de fundación. El worker «MapLibre» sustituye este componente por el
 * render real (MapLibre GL + teselas IGN cacheadas + estilo YourVivac). Mantener
 * la firma de props estable: el tablero (`pins.tsx`, `AddPinModal.tsx`) la importa.
 */
export function TopoMapLibre({ className }: TopoMapLibreProps) {
  return (
    <div
      className={className}
      style={{ display: 'grid', placeItems: 'center', background: 'var(--bg-3)' }}
    >
      <span className="faint mono text-[11px]">Mapa IGN (en construcción)</span>
    </div>
  );
}
