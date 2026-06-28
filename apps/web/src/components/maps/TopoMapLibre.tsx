import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import maplibregl, {
  type StyleSpecification,
  type RasterSourceSpecification,
  type LineLayerSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mlcontour from 'maplibre-contour';
import {
  Mountain,
  Tent,
  Droplet,
  Home,
  Car,
  Milestone,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeName, TopoMark, TopoMarkKind } from '@yourvivac/types';
import { api } from '@/lib/api';
import { useUiStore } from '@/stores/uiStore';
import type { LatLng } from '@/lib/maps';
import rawStyle from './yv-topo-style.json';
import './topo-maplibre.css';

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

/** Cada tipo de marca YourVivac se pinta con un icono de lucide dentro de un pin gota. */
const KIND_ICON: Record<TopoMarkKind, LucideIcon> = {
  cumbre: Mountain,
  refugio: Home,
  fuente: Droplet,
  vivac: Tent,
  parking: Car,
  cruce: Milestone,
  punto: MapPin,
};

const ROUTE_SOURCE = 'yv-route';
const ROUTE_HALO_LAYER = 'yv-route-halo';
const ROUTE_LINE_LAYER = 'yv-route-line';

/** Lee un token CSS (`--accent`, …) resuelto sobre el elemento; usa `fallback` si falta. */
function readToken(el: HTMLElement, name: string, fallback: string): string {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * DEM de elevación (Terrarium) compartido entre el sombreado y las curvas de
 * nivel. Singleton: el protocolo de maplibre-contour se registra una sola vez.
 */
let demSource: InstanceType<typeof mlcontour.DemSource> | null = null;
function getDemSource(): InstanceType<typeof mlcontour.DemSource> {
  if (demSource) return demSource;
  const tpl = api.maps.tileUrl('dem'); // `${base}/maps/tiles/dem/{z}/{x}/{y}`
  const url = tpl.startsWith('http') ? tpl : `${window.location.origin}${tpl}`;
  demSource = new mlcontour.DemSource({ url, encoding: 'terrarium', maxzoom: 13, worker: true });
  demSource.setupMaplibre(maplibregl);
  return demSource;
}

/** Style raster (capas IGN mtn/relieve/ortofoto): tesela IGN reestilada sutilmente. */
function buildRasterStyle(layer: string, host: HTMLElement): StyleSpecification {
  // structuredClone evita mutar el JSON importado (compartido entre instancias).
  const style = structuredClone(rawStyle) as unknown as StyleSpecification;
  const source = style.sources['yv-topo'] as RasterSourceSpecification;
  source.tiles = [api.maps.tileUrl(layer)];
  const bg = readToken(host, '--bg-3', '#1c271f');
  const bgLayer = style.layers.find((l) => l.id === 'yv-background');
  if (bgLayer && bgLayer.type === 'background') {
    bgLayer.paint = { ...bgLayer.paint, 'background-color': bg };
  }
  return style;
}

/**
 * Style «Topo YV»: NUESTRO mapa topográfico. Sombreado de relieve + curvas de
 * nivel generadas en el cliente desde el DEM (maplibre-contour), dibujadas con
 * la estética YourVivac. Vectorial → nítido y legible a cualquier zoom (arregla
 * el UX del zoom del raster). El intervalo de curvas se adapta por nivel de zoom.
 */
/** Paleta del topo según el tema de la app (dibujo ilustrado, no relieve fotográfico). */
function topoPalette(theme: ThemeName) {
  return theme === 'dark'
    ? {
        bg: '#131a16', // superficie oscura YourVivac
        minor: '#627d57',
        major: '#8fbb73',
        label: '#a8ce8f',
        halo: '#0e1411',
        hsShadow: '#0a0f0c',
        hsHighlight: '#222e26',
        hsAccent: '#2b3a2d',
      }
    : {
        bg: '#efe8d8', // papel cálido claro
        minor: '#b49b72',
        major: '#7f5f36',
        label: '#6e5230',
        halo: '#efe8d8',
        hsShadow: '#b8a988',
        hsHighlight: '#fffdf6',
        hsAccent: '#cdbf9d',
      };
}

/**
 * Style «Topo YV»: NUESTRO mapa topográfico como DIBUJO vectorial (no relieve
 * fotográfico). Curvas de nivel protagonistas + sombreado muy sutil, con paleta
 * que sigue el tema de la app (oscuro/claro). Generado en cliente desde el DEM.
 */
function buildTopoStyle(theme: ThemeName): StyleSpecification {
  const dem = getDemSource();
  const P = topoPalette(theme);
  return {
    version: 8,
    name: 'YourVivac Topo',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      'yv-dem': {
        type: 'raster-dem',
        tiles: [dem.sharedDemProtocolUrl],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 13,
      },
      'yv-contours': {
        type: 'vector',
        tiles: [
          dem.contourProtocolUrl({
            multiplier: 1,
            thresholds: {
              10: [200, 1000],
              11: [100, 500],
              12: [100, 500],
              13: [50, 250],
              14: [20, 100],
              15: [10, 50],
            },
            elevationKey: 'ele',
            levelKey: 'level',
            contourLayer: 'contours',
            overzoom: 1,
          }),
        ],
        maxzoom: 16,
      },
    },
    layers: [
      { id: 'yv-background', type: 'background', paint: { 'background-color': P.bg } },
      {
        // Sombreado MUY sutil (un lavado de profundidad, no «papel arrugado»).
        id: 'yv-hillshade',
        type: 'hillshade',
        source: 'yv-dem',
        paint: {
          'hillshade-exaggeration': 0.16,
          'hillshade-shadow-color': P.hsShadow,
          'hillshade-accent-color': P.hsAccent,
          'hillshade-highlight-color': P.hsHighlight,
        },
      },
      {
        id: 'yv-contour-minor',
        type: 'line',
        source: 'yv-contours',
        'source-layer': 'contours',
        filter: ['!=', ['get', 'level'], 1],
        paint: { 'line-color': P.minor, 'line-width': 0.7, 'line-opacity': 0.55 },
      },
      {
        id: 'yv-contour-major',
        type: 'line',
        source: 'yv-contours',
        'source-layer': 'contours',
        filter: ['==', ['get', 'level'], 1],
        paint: { 'line-color': P.major, 'line-width': 1.4, 'line-opacity': 0.95 },
      },
      {
        id: 'yv-contour-label',
        type: 'symbol',
        source: 'yv-contours',
        'source-layer': 'contours',
        filter: ['==', ['get', 'level'], 1],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['concat', ['number-format', ['get', 'ele'], {}], ' m'],
          'text-size': 10,
          'text-font': ['Noto Sans Regular'],
          'symbol-spacing': 220,
        },
        paint: {
          'text-color': P.label,
          'text-halo-color': P.halo,
          'text-halo-width': 1.4,
        },
      },
    ],
  } as StyleSpecification;
}

/** Devuelve el style según la capa: «base» = Topo YV (dibujo + curvas); resto = raster IGN. */
function buildStyle(layer: string, host: HTMLElement, theme: ThemeName): StyleSpecification {
  return layer === 'base' ? buildTopoStyle(theme) : buildRasterStyle(layer, host);
}

/** Crea el elemento HTML de un pin de marca con iconografía YourVivac. */
function createMarkElement(mark: TopoMark): { el: HTMLDivElement; root: Root } {
  const el = document.createElement('div');
  el.className = 'yv-topo-pin';
  el.dataset.kind = mark.kind;
  const Icon = KIND_ICON[mark.kind] ?? MapPin;
  const root = createRoot(el);
  root.render(
    <>
      <div className="yv-topo-pin__badge">
        <Icon size={14} strokeWidth={2.2} aria-hidden />
      </div>
      {mark.label ? <span className="yv-topo-pin__label">{mark.label}</span> : null}
    </>,
  );
  // En no interactivo (o táctil) un toque alterna la etiqueta.
  el.addEventListener('click', () => el.classList.toggle('is-open'));
  return { el, root };
}

/** Punto de inicio/fin de ruta diferenciado por color. */
function createDotElement(variant: 'start' | 'end'): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `yv-topo-dot yv-topo-dot--${variant}`;
  return el;
}

/**
 * Mapa topográfico IGN renderizado con MapLibre GL y la estética YourVivac.
 * Sin clave Google: las teselas (`api.maps.tileUrl`) las sirve/cachea la API.
 * Reutilizado por el tablero (pines `topo`/`route`) y la creación de marcas.
 */
export function TopoMapLibre({
  center,
  zoom = 13,
  layer = 'mtn',
  marks,
  route,
  className,
  interactive = false,
  onClick,
}: TopoMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const rootsRef = useRef<Root[]>([]);
  // onClick puede cambiar de identidad entre renders sin recrear el mapa.
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const [ready, setReady] = useState(false);
  // Tema de la app: el style «Topo YV» usa paleta oscura/clara y se reconstruye al cambiar.
  const theme = useUiStore((s) => s.theme);

  // --- Crear / destruir el mapa (se recrea solo al cambiar capa o modo) ---
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const map = new maplibregl.Map({
      container: host,
      style: buildStyle(layer, host, theme),
      center: [center.lng, center.lat],
      zoom,
      interactive,
      attributionControl: false,
      // sin logo/ruido en lectura; sólo arrastre/zoom cuando interactive
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }));
    }

    map.on('load', () => setReady(true));
    // Teselas que fallan (p. ej. backend stubeado en el harness): no romper el render.
    map.on('error', (e) => {
      if (import.meta.env.DEV) console.debug('[TopoMapLibre] tile/style error', e?.error?.message);
    });
    map.on('click', (e) => {
      onClickRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      setReady(false);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      // desmontar los roots de React de los pines tras el ciclo actual
      const roots = rootsRef.current;
      rootsRef.current = [];
      queueMicrotask(() => roots.forEach((r) => r.unmount()));
      map.remove();
      mapRef.current = null;
    };
    // center/zoom iniciales se aplican aquí; sus cambios posteriores van en otro efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, interactive, theme]);

  // --- Marcas (Markers con pin YourVivac) ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const oldRoots = rootsRef.current;
    rootsRef.current = [];
    queueMicrotask(() => oldRoots.forEach((r) => r.unmount()));

    for (const mark of marks ?? []) {
      const { el, root } = createMarkElement(mark);
      rootsRef.current.push(root);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([mark.coords.lng, mark.coords.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [ready, marks]);

  // --- Ruta (línea --accent con halo) + puntos inicio/fin ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const coords = (route ?? []).map((p) => [p.lng, p.lat]);
    const geojson = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: coords },
    };

    const existing = map.getSource(ROUTE_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(geojson);
    } else if (coords.length > 0) {
      const accent = readToken(map.getContainer(), '--accent', '#3f7a4d');
      const bg = readToken(map.getContainer(), '--bg', '#0e1411');
      map.addSource(ROUTE_SOURCE, { type: 'geojson', data: geojson });
      map.addLayer({
        id: ROUTE_HALO_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': bg,
          'line-width': 9,
          'line-opacity': 0.45,
          'line-blur': 2,
        },
      } satisfies LineLayerSpecification);
      map.addLayer({
        id: ROUTE_LINE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': accent,
          'line-width': 4,
          'line-opacity': 0.95,
        },
      } satisfies LineLayerSpecification);
    }

    // puntos inicio/fin: se gestionan junto a las marcas vía markersRef
    const startEnd: maplibregl.Marker[] = [];
    const first = route?.[0];
    if (first) {
      const start = new maplibregl.Marker({ element: createDotElement('start'), anchor: 'center' })
        .setLngLat([first.lng, first.lat])
        .addTo(map);
      startEnd.push(start);
      const last = route && route.length > 1 ? route[route.length - 1] : undefined;
      if (last) {
        const end = new maplibregl.Marker({ element: createDotElement('end'), anchor: 'center' })
          .setLngLat([last.lng, last.lat])
          .addTo(map);
        startEnd.push(end);
      }
    }
    markersRef.current.push(...startEnd);

    return () => {
      startEnd.forEach((m) => m.remove());
    };
  }, [ready, route]);

  // --- Encuadre: fitBounds a ruta/marcas, o jumpTo al centro ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const points: [number, number][] = [];
    for (const p of route ?? []) points.push([p.lng, p.lat]);
    for (const m of marks ?? []) points.push([m.coords.lng, m.coords.lat]);

    if (points.length === 0) {
      map.jumpTo({ center: [center.lng, center.lat], zoom });
      return;
    }
    const first = points[0];
    if (!first) return;
    if (points.length === 1) {
      map.jumpTo({ center: first, zoom });
      return;
    }
    const bounds = points.reduce(
      (b, p) => b.extend(p),
      new maplibregl.LngLatBounds(first, first),
    );
    map.fitBounds(bounds, { padding: interactive ? 56 : 28, maxZoom: 15, duration: 0 });
  }, [ready, route, marks, center, zoom, interactive]);

  return <div ref={containerRef} className={className} aria-label="Mapa topográfico IGN" />;
}
