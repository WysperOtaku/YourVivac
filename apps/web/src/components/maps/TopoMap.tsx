import { Map, Marker, Polyline } from '@vis.gl/react-google-maps';
import type { LatLng } from '@/lib/maps';

interface Props {
  center: LatLng;
  zoom?: number;
  marker?: LatLng | null;
  path?: LatLng[];
  className?: string;
  /** Mapa interactivo (true) o solo lectura compacto (false). */
  interactive?: boolean;
  onClick?: (coords: LatLng) => void;
  mapId?: string;
}

/**
 * Mapa topográfico (tipo `terrain` de Google) con marcador y ruta opcionales.
 * Reutilizado en pines, creación de salidas y detalle.
 */
export function TopoMap({ center, zoom = 13, marker, path, className, interactive = false, onClick, mapId }: Props) {
  return (
    <div className={className}>
      <Map
        mapId={mapId}
        defaultCenter={center}
        defaultZoom={zoom}
        mapTypeId="terrain"
        gestureHandling={interactive ? 'greedy' : 'none'}
        disableDefaultUI
        zoomControl={interactive}
        clickableIcons={false}
        style={{ width: '100%', height: '100%' }}
        onClick={(e) => {
          const ll = e.detail.latLng;
          if (ll && onClick) onClick({ lat: ll.lat, lng: ll.lng });
        }}
      >
        {marker && <Marker position={marker} />}
        {path && path.length > 1 && (
          <Polyline path={path} strokeColor="#3f7a4d" strokeOpacity={0.95} strokeWeight={4} />
        )}
        {path?.map((p, i) => (i === 0 || i === path.length - 1 ? <Marker key={i} position={p} /> : null))}
      </Map>
    </div>
  );
}
