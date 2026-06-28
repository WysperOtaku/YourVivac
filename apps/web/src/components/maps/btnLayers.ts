import type { ThemeName } from '@yourvivac/types';
import type { Map as MlMap } from 'maplibre-gl';

/**
 * Capas vectoriales de la BTN del IGN (source `yv-btn`) estilizadas con la paleta
 * YourVivac: agua, viario (carreteras/caminos/sendas/itinerarios), topónimos de
 * poblaciones, cumbres y servicios/refugios. Es el «calco» del mapa IGN en F2.
 * Los iconos de cumbre/refugio se generan en runtime (registerTopoIcons).
 */
const SRC = 'yv-btn';

interface Pal {
  water: string;
  waterFill: string;
  green: string;
  building: string;
  tree: string;
  carretera: string;
  camino: string;
  senda: string;
  itinerario: string;
  ink: string;
  halo: string;
  peak: string;
}

function pal(theme: ThemeName): Pal {
  return theme === 'dark'
    ? { water: '#5a8a99', waterFill: '#2b424a', green: '#2f3f27', building: '#403a33', tree: '#4d6b40', carretera: '#9a948a', camino: '#a98a5f', senda: '#c08a52', itinerario: '#7cc063', ink: '#e7efe1', halo: '#0e1411', peak: '#e0a06a' }
    : { water: '#5f97a8', waterFill: '#bcd9e0', green: '#bcd3a0', building: '#caa884', tree: '#5e8a4a', carretera: '#b8b2a6', camino: '#a98a5f', senda: '#b06a3a', itinerario: '#3f7a4d', ink: '#2c3826', halo: '#f6f2e6', peak: '#8a5a2e' };
}

/** Capas BTN (orden: agua → viario → etiquetas/puntos) para fundir en el style Topo YV. */
export function btnOverlayLayers(theme: ThemeName): unknown[] {
  const p = pal(theme);
  return [
    // --- agua ---
    { id: 'yv-embalse', type: 'fill', source: SRC, 'source-layer': 'btn0325s_embalse', paint: { 'fill-color': p.waterFill, 'fill-opacity': 0.75 } },
    { id: 'yv-laguna', type: 'fill', source: SRC, 'source-layer': 'btn0316s_laguna', paint: { 'fill-color': p.waterFill, 'fill-opacity': 0.75 } },
    // zonas verdes (parques/áreas verdes)
    { id: 'yv-zonver', type: 'fill', source: SRC, 'source-layer': 'btn0561s_zon_ver', minzoom: 12, paint: { 'fill-color': p.green, 'fill-opacity': 0.55 } },
    // --- árboles (pista de zona boscosa; la BTN no trae masa forestal) ---
    { id: 'yv-arbol', type: 'circle', source: SRC, 'source-layer': 'btn0404p_arbol', minzoom: 14, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 1, 17, 2.6], 'circle-color': p.tree, 'circle-opacity': 0.5 } },
    // --- edificios ---
    { id: 'yv-edificio', type: 'fill', source: SRC, 'source-layer': 'btn0507s_edific', minzoom: 13, paint: { 'fill-color': p.building, 'fill-opacity': 0.85 } },
    { id: 'yv-rio', type: 'line', source: SRC, 'source-layer': 'btn0302l_rio', minzoom: 9, paint: { 'line-color': p.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 15, 2], 'line-opacity': 0.85 } },
    // --- viario ---
    { id: 'yv-carretera', type: 'line', source: SRC, 'source-layer': 'btn0605l_carretera', minzoom: 11, paint: { 'line-color': p.carretera, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 16, 2.6], 'line-opacity': 0.85 } },
    { id: 'yv-camino', type: 'line', source: SRC, 'source-layer': 'btn0623l_camino', minzoom: 12, paint: { 'line-color': p.camino, 'line-width': 0.9, 'line-opacity': 0.7, 'line-dasharray': [3, 2] } },
    { id: 'yv-senda', type: 'line', source: SRC, 'source-layer': 'btn0626l_senda', minzoom: 12, paint: { 'line-color': p.senda, 'line-width': 1.1, 'line-opacity': 0.85, 'line-dasharray': [2, 1.6] } },
    { id: 'yv-itinerario', type: 'line', source: SRC, 'source-layer': 'btn0632l_itiner', minzoom: 11, paint: { 'line-color': p.itinerario, 'line-width': 2, 'line-opacity': 0.85, 'line-dasharray': [3, 1.5] } },
    // --- topónimos GENERALES (parajes, montañas, áreas) — campo `nombre` ---
    {
      id: 'yv-toponimo',
      type: 'symbol',
      source: SRC,
      'source-layer': 'btn0801p_top_sin_geo',
      minzoom: 12,
      layout: { 'text-field': ['get', 'nombre'], 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 13], 'text-max-width': 7, 'text-padding': 3 },
      paint: { 'text-color': p.ink, 'text-halo-color': p.halo, 'text-halo-width': 1.4, 'text-opacity': 0.92 },
    },
    // --- topónimos de poblaciones (pueblos) ---
    {
      id: 'yv-poblacion',
      type: 'symbol',
      source: SRC,
      'source-layer': 'btn0502p_ent_pob',
      minzoom: 9,
      layout: { 'text-field': ['get', 'nombre'], 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 15, 16] },
      paint: { 'text-color': p.ink, 'text-halo-color': p.halo, 'text-halo-width': 1.8 },
    },
    // --- cumbres / puntos acotados (icono + COTA, no tienen nombre) ---
    {
      id: 'yv-peak',
      type: 'symbol',
      source: SRC,
      'source-layer': 'btn0204p_pun_aco',
      minzoom: 12,
      layout: { 'icon-image': 'yv-peak', 'icon-size': 0.8, 'icon-allow-overlap': true, 'text-field': ['concat', ['to-string', ['get', 'cota_0204']], ' m'], 'text-font': ['Noto Sans Regular'], 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    // --- refugios/albergues (servicios filtrados) ---
    {
      id: 'yv-refuge',
      type: 'symbol',
      source: SRC,
      'source-layer': 'btn0590p_ser_ins',
      minzoom: 13,
      filter: ['match', ['get', 'tipo_0590'], ['08 ALBERGUE', '10 PARADOR'], true, false],
      layout: { 'icon-image': 'yv-refuge', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': ['Noto Sans Regular'], 'text-size': 10, 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
  ];
}

/** Genera en runtime los iconos YourVivac (cumbre, refugio) que piden las symbol layers. */
export function registerTopoIcons(map: MlMap, theme: ThemeName): void {
  const fill = theme === 'dark' ? '#c47a3f' : '#8a5230';
  const make = (id: string): ImageData | null => {
    const s = 30;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = fill;
    if (id === 'yv-peak') {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 4);
      ctx.lineTo(27, 26);
      ctx.lineTo(3, 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (id === 'yv-refuge') {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(15, 4);
      ctx.lineTo(27, 14);
      ctx.lineTo(23, 14);
      ctx.lineTo(23, 26);
      ctx.lineTo(7, 26);
      ctx.lineTo(7, 14);
      ctx.lineTo(3, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      return null;
    }
    return ctx.getImageData(0, 0, s, s);
  };
  map.on('styleimagemissing', (e: { id: string }) => {
    if (map.hasImage(e.id)) return;
    const img = make(e.id);
    if (img) map.addImage(e.id, img, { pixelRatio: 2 });
  });
}
