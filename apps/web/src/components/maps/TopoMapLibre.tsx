import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import maplibregl, {
  type StyleSpecification,
  type RasterSourceSpecification,
  type LineLayerSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Mountain,
  Tent,
  Droplet,
  Home,
  Car,
  Milestone,
  MapPin,
  Crosshair,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeName, TopoMark, TopoMarkKind } from '@yourvivac/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/uiStore';
import type { LatLng } from '@/lib/maps';
import { btnOverlayLayers, adminLabelLayers, registerTopoIcons } from './btnLayers';
import rawStyle from './yv-topo-style.json';
import './topo-maplibre.css';

export type TopoView = 'base' | 'mtn' | 'relieve' | 'ortofoto';

export interface TopoMapLibreProps {
  /** Centro del mapa = localización del pin (lleva marcador prominente). */
  center: LatLng;
  zoom?: number;
  /** Vista/capa base inicial. */
  layer?: TopoView;
  /** Marcas/iconos YourVivac (cumbre, refugio, fuente, vivac…). */
  marks?: TopoMark[];
  /** Polilínea de ruta (pin `route`). */
  route?: LatLng[];
  className?: string;
  /** Mapa interactivo (true) o solo lectura compacto (false). */
  interactive?: boolean;
  /** Muestra controles in-map (selector de vista + recentrar). */
  controls?: boolean;
  /** Click en el mapa → coordenadas (para colocar marcas o waypoints). */
  onClick?: (coords: LatLng) => void;
  /** Cambio de vista (para persistir la elección si interesa). */
  onViewChange?: (view: TopoView) => void;
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

/** Vistas del mapa: «Topo YV» (nuestro) + raster IGN. Espejo entre IGN y el nuestro. */
const VIEWS: { key: TopoView; short: string; label: string }[] = [
  { key: 'base', short: 'Topo', label: 'Topo YV' },
  { key: 'mtn', short: 'IGN', label: 'Mapa IGN' },
  { key: 'relieve', short: 'Relieve', label: 'Relieve' },
  { key: 'ortofoto', short: 'Sat', label: 'Satélite' },
];

const ROUTE_SOURCE = 'yv-route';
const ROUTE_HALO_LAYER = 'yv-route-halo';
const ROUTE_LINE_LAYER = 'yv-route-line';

/** Lee un token CSS (`--accent`, …) resuelto sobre el elemento; usa `fallback` si falta. */
function readToken(el: HTMLElement, name: string, fallback: string): string {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/** URL ABSOLUTA de teselas (MapLibre resuelve mal las relativas en fuentes vector). */
function tileUrlAbs(layer: string): string {
  const u = api.maps.tileUrl(layer);
  return u.startsWith('http') ? u : `${window.location.origin}${u}`;
}

/** Bandas hipsométricas [altura, color] según el tema (estética cartoon/plana). */
function topoBands(theme: ThemeName): [number, string][] {
  return theme === 'dark'
    ? [
        [0, '#18241c'], [300, '#1d2a20'], [600, '#243025'], [900, '#2c3829'],
        [1200, '#37402e'], [1600, '#454a35'], [2000, '#56533d'], [2400, '#6b6450'],
        [2800, '#878069'], [3200, '#a8a087'],
      ]
    : [
        [0, '#d8e8bf'], [300, '#c9dca6'], [600, '#cdd79a'], [900, '#d6cd93'],
        [1200, '#d8c184'], [1600, '#cbaa6e'], [2000, '#bf9a63'], [2400, '#b89a78'],
        [2800, '#cfc3a8'], [3200, '#eae3d2'],
      ];
}

/** Construye un color-relief de BANDAS planas (cartoon): saltos casi netos por cota. */
function steppedColorRelief(bands: [number, string][]): unknown[] {
  const expr: unknown[] = ['interpolate', ['linear'], ['elevation']];
  bands.forEach(([elev, color], i) => {
    if (i > 0) expr.push(elev - 0.5, bands[i - 1]![1]); // mantiene el color anterior hasta el salto
    expr.push(elev, color);
  });
  return expr;
}

/** Style raster (vistas IGN mtn/relieve/ortofoto): tesela IGN reestilada sutilmente. */
function buildRasterStyle(layer: string, host: HTMLElement): StyleSpecification {
  // structuredClone evita mutar el JSON importado (compartido entre instancias).
  const style = structuredClone(rawStyle) as unknown as StyleSpecification;
  const source = style.sources['yv-topo'] as RasterSourceSpecification;
  source.tiles = [tileUrlAbs(layer)];
  const bg = readToken(host, '--bg-3', '#1c271f');
  const bgLayer = style.layers.find((l) => l.id === 'yv-background');
  if (bgLayer && bgLayer.type === 'background') {
    bgLayer.paint = { ...bgLayer.paint, 'background-color': bg };
  }
  return style;
}

/**
 * Style «Topo YV»: NUESTRO mapa topográfico. Terreno COLOREADO por altura
 * (color-relief desde el MDT del IGN) + sombreado sutil + curvas de nivel
 * vectoriales del IGN (BTN). Paleta según el tema de la app (oscuro/claro).
 */
function buildTopoStyle(theme: ThemeName): StyleSpecification {
  const dark = theme === 'dark';
  const colorRelief = steppedColorRelief(topoBands(theme));
  const bg = dark ? '#10180f' : '#dfe6c8';
  const contour = dark ? '#8a7d5e' : '#9c7236';

  return {
    version: 8,
    name: 'YourVivac Topo',
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      // MDT del IGN (encoding mapbox): alimenta color-relief y hillshade.
      'yv-dem': { type: 'raster-dem', tiles: [tileUrlAbs('mdt')], encoding: 'mapbox', tileSize: 256, maxzoom: 14 },
      // Base vectorial del IGN (BTN): de aquí salen las curvas de nivel (y, en F2, todo lo demás).
      'yv-btn': { type: 'vector', tiles: [tileUrlAbs('btn')], minzoom: 0, maxzoom: 14 },
      // Unidades Administrativas del IGN: topónimos grandes (CCAA/provincia/municipio).
      'yv-uadmin': { type: 'vector', tiles: [tileUrlAbs('uadmin')], minzoom: 0, maxzoom: 12 },
    },
    layers: [
      { id: 'yv-background', type: 'background', paint: { 'background-color': bg } },
      // Terreno coloreado por altura (hipsométrico).
      { id: 'yv-color-relief', type: 'color-relief', source: 'yv-dem', paint: { 'color-relief-color': colorRelief } },
      // Sombreado MUY tenue: cartoon/vector, no relieve fotográfico.
      { id: 'yv-hillshade', type: 'hillshade', source: 'yv-dem', paint: { 'hillshade-exaggeration': 0.07, 'hillshade-method': 'igor' } },
      // Curvas de nivel del IGN (BTN).
      {
        id: 'yv-contour',
        type: 'line',
        source: 'yv-btn',
        'source-layer': 'btn0201l_cur_niv',
        minzoom: 12,
        paint: { 'line-color': contour, 'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 15, 0.9], 'line-opacity': dark ? 0.55 : 0.62 },
      },
      // Calco vectorial del IGN: agua, viario, topónimos, cumbres, refugios (F2).
      ...btnOverlayLayers(theme),
      // Topónimos administrativos (CCAA/provincia/municipio) a escalas lejanas.
      ...adminLabelLayers(theme),
    ],
  } as unknown as StyleSpecification;
}

/** Devuelve el style según la vista: «base» = Topo YV (color-relief); resto = raster IGN. */
function buildStyle(view: string, host: HTMLElement, theme: ThemeName): StyleSpecification {
  return view === 'base' ? buildTopoStyle(theme) : buildRasterStyle(view, host);
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

/** Marcador prominente de la localización del pin (centro). */
function createCenterElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'yv-topo-loc';
  return el;
}

/** Punto de inicio/fin de ruta diferenciado por color. */
function createDotElement(variant: 'start' | 'end'): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `yv-topo-dot yv-topo-dot--${variant}`;
  return el;
}

/**
 * Mini-visor topográfico (MapLibre GL) con la estética YourVivac: terreno
 * coloreado por altura, curvas del IGN y marcas propias. Selector de vista
 * (Topo YV / IGN / Relieve / Satélite) y recentrado al marcador. Las teselas
 * (`api.maps.tileUrl`) las sirve/cachea la API.
 */
export function TopoMapLibre({
  center,
  zoom = 13,
  layer = 'base',
  marks,
  route,
  className,
  interactive = false,
  controls = false,
  onClick,
  onViewChange,
}: TopoMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const rootsRef = useRef<Root[]>([]);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<TopoView>(layer);
  // Tema de la app: el style «Topo YV» usa paleta oscura/clara y se reconstruye al cambiar.
  const theme = useUiStore((s) => s.theme);
  const hasRoute = (route?.length ?? 0) > 0;

  // Si la vista inicial cambia desde fuera (prop), sincroniza.
  useEffect(() => setView(layer), [layer]);

  // --- Crear / destruir el mapa (se recrea al cambiar vista, modo o tema) ---
  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    const map = new maplibregl.Map({
      container: host,
      style: buildStyle(view, host, theme),
      center: [center.lng, center.lat],
      zoom,
      interactive,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      // Carga vecinos al hacer zoom (sectores de alrededor) más fluido.
      maxTileCacheSize: 512,
    });
    mapRef.current = map;
    // Iconos YourVivac (cumbre, refugio) generados en runtime para las symbol layers BTN.
    registerTopoIcons(map, theme);

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }));
    }

    map.on('load', () => setReady(true));
    map.on('error', (e) => {
      // En dev mostramos los errores de estilo/tesela; en prod no hacen ruido.
      if (import.meta.env.DEV) console.warn('[TopoMapLibre]', e?.error?.message);
    });
    map.on('click', (e) => {
      onClickRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      setReady(false);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const roots = rootsRef.current;
      rootsRef.current = [];
      queueMicrotask(() => roots.forEach((r) => r.unmount()));
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, interactive, theme]);

  // --- Marcas (Markers con pin YourVivac) + marcador central de localización ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const oldRoots = rootsRef.current;
    rootsRef.current = [];
    queueMicrotask(() => oldRoots.forEach((r) => r.unmount()));

    // Marcador prominente de la localización del pin (solo si no es una ruta).
    if (!hasRoute) {
      const loc = new maplibregl.Marker({ element: createCenterElement(), anchor: 'center' })
        .setLngLat([center.lng, center.lat])
        .addTo(map);
      markersRef.current.push(loc);
    }

    for (const mark of marks ?? []) {
      const { el, root } = createMarkElement(mark);
      rootsRef.current.push(root);
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([mark.coords.lng, mark.coords.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [ready, marks, center.lat, center.lng, hasRoute]);

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
        paint: { 'line-color': bg, 'line-width': 9, 'line-opacity': 0.45, 'line-blur': 2 },
      } satisfies LineLayerSpecification);
      map.addLayer({
        id: ROUTE_LINE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': accent, 'line-width': 4, 'line-opacity': 0.95 },
      } satisfies LineLayerSpecification);
    }

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

  // --- Encuadre: orientado al marcador (centro) + marcas/ruta ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const points: [number, number][] = [];
    for (const p of route ?? []) points.push([p.lng, p.lat]);
    for (const m of marks ?? []) points.push([m.coords.lng, m.coords.lat]);
    // El marcador de localización siempre entra en el encuadre.
    if (!hasRoute) points.push([center.lng, center.lat]);

    if (points.length <= 1) {
      map.jumpTo({ center: [center.lng, center.lat], zoom });
      return;
    }
    const first = points[0]!;
    const bounds = points.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(first, first));
    map.fitBounds(bounds, { padding: interactive ? 56 : 30, maxZoom: 15, duration: 0 });
  }, [ready, route, marks, center.lat, center.lng, zoom, interactive, hasRoute]);

  function changeView(v: TopoView) {
    setView(v);
    onViewChange?.(v);
  }
  function recenter() {
    mapRef.current?.flyTo({ center: [center.lng, center.lat], zoom: zoom ?? 13, duration: 500 });
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div ref={containerRef} className="absolute inset-0" aria-label="Mapa topográfico" />
      {controls && (
        <>
          {/* Selector de vista (Topo YV / IGN / Relieve / Satélite), arriba-izquierda. */}
          <div
            className="absolute left-2 top-2 z-10 row gap-1 rounded-control bg-bg-2/90 p-1 shadow-[inset_0_0_0_1px_var(--line)] backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                title={v.label}
                onClick={(e) => {
                  e.stopPropagation();
                  changeView(v.key);
                }}
                className={cn(
                  'mono rounded-[7px] px-2 py-1 text-[11px]',
                  view === v.key ? 'bg-accent text-accent-ink' : 'text-ink-3 hover:text-ink',
                )}
              >
                {v.short}
              </button>
            ))}
          </div>
          {/* Recentrar al marcador */}
          <button
            type="button"
            title="Centrar en el marcador"
            onClick={(e) => {
              e.stopPropagation();
              recenter();
            }}
            className="absolute bottom-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-bg-2/90 text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] backdrop-blur hover:text-accent"
          >
            <Crosshair size={16} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
