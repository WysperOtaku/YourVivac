import type { ThemeName } from '@yourvivac/types';
import type { Map as MlMap } from 'maplibre-gl';

/**
 * Calco vectorial del IGN con estética YourVivac. Dos fuentes:
 *  - `yv-btn`     (Base Topográfica Nacional): detalle — agua, viario, edificios,
 *                 topónimos, cumbres, curvas, parques… (z hasta 14).
 *  - `yv-uadmin`  (Unidades Administrativas): topónimos grandes — comunidades,
 *                 provincias y municipios (escalas lejanas).
 * Iconos de cumbre/refugio se generan en runtime (registerTopoIcons).
 */
const BTN = 'yv-btn';
const ADM = 'yv-uadmin';
const FONT = ['Noto Sans Regular'];

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
  contour: string;
  ink: string;
  inkSoft: string;
  halo: string;
  peak: string;
  river: string;
}

function pal(theme: ThemeName): Pal {
  return theme === 'dark'
    ? { water: '#5a8a99', waterFill: '#2b424a', green: '#2f3f27', building: '#403a33', tree: '#4d6b40', carretera: '#9a948a', camino: '#a98a5f', senda: '#c08a52', itinerario: '#7cc063', contour: '#7a6e54', ink: '#e7efe1', inkSoft: '#aebaa4', halo: '#0e1411', peak: '#e0a06a', river: '#7fb3c4' }
    : { water: '#5f97a8', waterFill: '#bcd9e0', green: '#bcd3a0', building: '#caa884', tree: '#5e8a4a', carretera: '#b8b2a6', camino: '#a98a5f', senda: '#b06a3a', itinerario: '#3f7a4d', contour: '#9a7a4e', ink: '#2c3826', inkSoft: '#6a7560', halo: '#f6f2e6', peak: '#8a5a2e', river: '#4a7c8c' };
}

/** Texto de etiqueta común. */
function label(field: unknown, size: unknown, color: string, halo: string, extra: Record<string, unknown> = {}) {
  return {
    layout: { 'text-field': field, 'text-font': FONT, 'text-size': size, ...extra },
    paint: { 'text-color': color, 'text-halo-color': halo, 'text-halo-width': 1.5 },
  };
}

/** Capas de la BTN (detalle) para fundir en el style Topo YV. */
export function btnOverlayLayers(theme: ThemeName): unknown[] {
  const p = pal(theme);
  const isIndex = ['==', ['%', ['to-number', ['get', 'cota_0201']], 100], 0]; // curva maestra ~cada 100 m
  return [
    // --- superficies (agua, verde, edificios) ---
    { id: 'yv-park', type: 'fill', source: BTN, 'source-layer': 'btn0107s_zon_pro', paint: { 'fill-color': p.green, 'fill-opacity': 0.28 } },
    { id: 'yv-zonver', type: 'fill', source: BTN, 'source-layer': 'btn0561s_zon_ver', minzoom: 12, paint: { 'fill-color': p.green, 'fill-opacity': 0.5 } },
    { id: 'yv-rio-s', type: 'fill', source: BTN, 'source-layer': 'btn0302s_rio', paint: { 'fill-color': p.waterFill, 'fill-opacity': 0.8 } },
    { id: 'yv-embalse', type: 'fill', source: BTN, 'source-layer': 'btn0325s_embalse', paint: { 'fill-color': p.waterFill, 'fill-opacity': 0.8 } },
    { id: 'yv-laguna', type: 'fill', source: BTN, 'source-layer': 'btn0316s_laguna', paint: { 'fill-color': p.waterFill, 'fill-opacity': 0.8 } },
    { id: 'yv-arbol', type: 'circle', source: BTN, 'source-layer': 'btn0404p_arbol', minzoom: 14, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 1, 17, 2.6], 'circle-color': p.tree, 'circle-opacity': 0.5 } },
    { id: 'yv-edificio', type: 'fill', source: BTN, 'source-layer': 'btn0507s_edific', minzoom: 13, paint: { 'fill-color': p.building, 'fill-opacity': 0.85 } },
    // --- agua lineal ---
    { id: 'yv-rio', type: 'line', source: BTN, 'source-layer': 'btn0302l_rio', minzoom: 9, paint: { 'line-color': p.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 15, 2], 'line-opacity': 0.85 } },
    // --- curvas índice (más marcadas) ---
    { id: 'yv-contour-index', type: 'line', source: BTN, 'source-layer': 'btn0201l_cur_niv', minzoom: 12, filter: isIndex, paint: { 'line-color': p.contour, 'line-width': 1.1, 'line-opacity': 0.75 } },
    // --- viario ---
    { id: 'yv-carretera', type: 'line', source: BTN, 'source-layer': 'btn0605l_carretera', minzoom: 11, paint: { 'line-color': p.carretera, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 16, 2.6], 'line-opacity': 0.85 } },
    { id: 'yv-camino', type: 'line', source: BTN, 'source-layer': 'btn0623l_camino', minzoom: 12, paint: { 'line-color': p.camino, 'line-width': 0.9, 'line-opacity': 0.7, 'line-dasharray': [3, 2] } },
    { id: 'yv-senda', type: 'line', source: BTN, 'source-layer': 'btn0626l_senda', minzoom: 12, paint: { 'line-color': p.senda, 'line-width': 1.1, 'line-opacity': 0.85, 'line-dasharray': [2, 1.6] } },
    { id: 'yv-itinerario', type: 'line', source: BTN, 'source-layer': 'btn0632l_itiner', minzoom: 11, paint: { 'line-color': p.itinerario, 'line-width': 2, 'line-opacity': 0.85, 'line-dasharray': [3, 1.5] } },

    // ====== ETIQUETAS ======
    // cota en curvas índice (saber si sube/baja)
    {
      id: 'yv-contour-label', type: 'symbol', source: BTN, 'source-layer': 'btn0201l_cur_niv', minzoom: 13, filter: isIndex,
      ...label(['concat', ['to-string', ['get', 'cota_0201']], ' m'], 10, p.contour, p.halo, { 'symbol-placement': 'line', 'symbol-spacing': 350, 'text-rotation-alignment': 'map', 'text-pitch-alignment': 'viewport' }),
    },
    // ríos (nombre, sobre la línea)
    {
      id: 'yv-rio-label', type: 'symbol', source: BTN, 'source-layer': 'btn0302l_rio', minzoom: 13,
      ...label(['get', 'nombre'], 10, p.river, p.halo, { 'symbol-placement': 'line', 'symbol-spacing': 300 }),
    },
    // valles / rotulación lineal
    {
      id: 'yv-valle-label', type: 'symbol', source: BTN, 'source-layer': 'btn0803l_lin_rot', minzoom: 11,
      ...label(['get', 'nombre'], ['interpolate', ['linear'], ['zoom'], 11, 11, 15, 15], p.inkSoft, p.halo, { 'symbol-placement': 'line', 'text-letter-spacing': 0.08 }),
    },
    // parques naturales (centroide)
    {
      id: 'yv-park-label', type: 'symbol', source: BTN, 'source-layer': 'btn0107s_zon_pro', minzoom: 9,
      ...label(['get', 'nombre'], ['interpolate', ['linear'], ['zoom'], 9, 11, 14, 15], theme === 'dark' ? '#8fbb73' : '#3f7a4d', p.halo, { 'text-max-width': 8, 'text-letter-spacing': 0.05 }),
    },
    // lagos / lagunas (nombre)
    {
      id: 'yv-laguna-label', type: 'symbol', source: BTN, 'source-layer': 'btn0316s_laguna', minzoom: 12,
      ...label(['get', 'nombre'], 11, p.river, p.halo, { 'text-max-width': 7 }),
    },
    // topónimos generales (parajes, montañas, áreas)
    {
      id: 'yv-toponimo', type: 'symbol', source: BTN, 'source-layer': 'btn0801p_top_sin_geo', minzoom: 12,
      ...label(['get', 'nombre'], ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 13], p.ink, p.halo, { 'text-max-width': 7, 'text-padding': 2 }),
    },
    // poblaciones
    {
      id: 'yv-poblacion', type: 'symbol', source: BTN, 'source-layer': 'btn0502p_ent_pob', minzoom: 9,
      ...label(['get', 'nombre'], ['interpolate', ['linear'], ['zoom'], 9, 11, 15, 16], p.ink, p.halo, {}),
    },
    // cumbres (icono + cota)
    {
      id: 'yv-peak', type: 'symbol', source: BTN, 'source-layer': 'btn0204p_pun_aco', minzoom: 12,
      layout: { 'icon-image': 'yv-peak', 'icon-size': 0.8, 'icon-allow-overlap': true, 'text-field': ['concat', ['to-string', ['get', 'cota_0204']], ' m'], 'text-font': FONT, 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    // refugios / referencias visuales (torres, refugios, ermitas…) con icono + nombre
    {
      id: 'yv-refuge', type: 'symbol', source: BTN, 'source-layer': 'btn0534s_ref_vis', minzoom: 12,
      layout: { 'icon-image': 'yv-refuge', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 10, 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
  ];
}

/** Etiquetas administrativas (CCAA / provincia / municipio) — fuente yv-uadmin. */
export function adminLabelLayers(theme: ThemeName): unknown[] {
  const p = pal(theme);
  return [
    {
      id: 'yv-municipio', type: 'symbol', source: ADM, 'source-layer': 'municipio', minzoom: 9, maxzoom: 12,
      ...label(['get', 'nameunit'], ['interpolate', ['linear'], ['zoom'], 9, 11, 12, 14], p.inkSoft, p.halo, { 'text-max-width': 8 }),
    },
    {
      id: 'yv-provincia', type: 'symbol', source: ADM, 'source-layer': 'provincia', minzoom: 6, maxzoom: 10,
      ...label(['get', 'nameunit'], ['interpolate', ['linear'], ['zoom'], 6, 12, 9, 17], p.ink, p.halo, { 'text-letter-spacing': 0.08, 'text-transform': 'uppercase', 'text-max-width': 9 }),
    },
    {
      id: 'yv-ccaa', type: 'symbol', source: ADM, 'source-layer': 'comunidadautonoma', minzoom: 4, maxzoom: 7,
      ...label(['upcase', ['get', 'nameunit']], ['interpolate', ['linear'], ['zoom'], 4, 12, 7, 20], p.ink, p.halo, { 'text-letter-spacing': 0.12, 'text-max-width': 9 }),
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
