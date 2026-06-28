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
    ? { water: '#5a8a99', waterFill: '#2b424a', green: '#2f3f27', building: '#403a33', tree: '#4d6b40', carretera: '#9a948a', camino: '#a98a5f', senda: '#c08a52', itinerario: '#7cc063', contour: '#988a68', ink: '#e7efe1', inkSoft: '#aebaa4', halo: '#0e1411', peak: '#e0a06a', river: '#7fb3c4' }
    : { water: '#5f97a8', waterFill: '#bcd9e0', green: '#bcd3a0', building: '#caa884', tree: '#5e8a4a', carretera: '#b8b2a6', camino: '#a98a5f', senda: '#b06a3a', itinerario: '#3f7a4d', contour: '#9c7236', ink: '#2c3826', inkSoft: '#6a7560', halo: '#f6f2e6', peak: '#8a5a2e', river: '#4a7c8c' };
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
    { id: 'yv-arbol', type: 'circle', source: BTN, 'source-layer': 'btn0404p_arbol', minzoom: 13, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 1.2, 17, 3.2], 'circle-color': p.tree, 'circle-opacity': 0.6, 'circle-stroke-width': 0.4, 'circle-stroke-color': p.halo } },
    { id: 'yv-edificio', type: 'fill', source: BTN, 'source-layer': 'btn0507s_edific', minzoom: 13, paint: { 'fill-color': p.building, 'fill-opacity': 0.85 } },
    // --- agua lineal ---
    { id: 'yv-rio', type: 'line', source: BTN, 'source-layer': 'btn0302l_rio', minzoom: 9, paint: { 'line-color': p.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 15, 2], 'line-opacity': 0.85 } },
    // --- curvas índice (más marcadas) ---
    { id: 'yv-contour-index', type: 'line', source: BTN, 'source-layer': 'btn0201l_cur_niv', minzoom: 11, filter: isIndex, paint: { 'line-color': p.contour, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.9, 15, 1.7], 'line-opacity': 0.92 } },
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
    // collados/puertos (texto pequeño)
    {
      id: 'yv-collado', type: 'symbol', source: BTN, 'source-layer': 'btn0204p_pun_aco', minzoom: 13,
      filter: ['==', ['get', 'tipo_0204'], '04 COLLADO'],
      ...label(['get', 'nombre'], 9.5, p.inkSoft, p.halo, { 'text-optional': true }),
    },
    // CUMBRES: solo «02 CIMA» (las de verdad, con nombre + cota). Declutter para no saturar.
    {
      id: 'yv-peak', type: 'symbol', source: BTN, 'source-layer': 'btn0204p_pun_aco', minzoom: 12,
      filter: ['==', ['get', 'tipo_0204'], '02 CIMA'],
      layout: {
        'icon-image': 'yv-peak', 'icon-size': 0.85, 'icon-allow-overlap': false, 'text-allow-overlap': false,
        'text-field': ['format', ['get', 'nombre'], {}, '\n', {}, ['concat', ['to-string', ['get', 'cota_0204']], ' m'], { 'font-scale': 0.85 }],
        'text-font': FONT, 'text-size': 10.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true,
      },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.5 },
    },
    // REFUGIOS de montaña (edificio con tipo «07 REFUGIO DE MONTAÑA»)
    {
      id: 'yv-refuge', type: 'symbol', source: BTN, 'source-layer': 'btn0507s_edific', minzoom: 12,
      filter: ['==', ['get', 'tipo_0507'], '07 REFUGIO DE MONTAÑA'],
      layout: { 'icon-image': 'yv-refuge', 'icon-size': 0.9, 'icon-allow-overlap': true, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 10.5, 'text-anchor': 'top', 'text-offset': [0, 0.95], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.5 },
    },
    // sendas/GR-PR: etiqueta corta sobre la línea (GR 11, PR-HU 028…)
    {
      id: 'yv-itin-label', type: 'symbol', source: BTN, 'source-layer': 'btn0632l_itiner', minzoom: 12,
      ...label(['coalesce', ['get', 'etiqueta'], ['get', 'nombre']], 10, theme === 'dark' ? '#8fd07a' : '#2f6b3e', p.halo, { 'symbol-placement': 'line', 'symbol-spacing': 260 }),
    },
    // río superficie (Río Ésera…): nombre
    {
      id: 'yv-rio-s-label', type: 'symbol', source: BTN, 'source-layer': 'btn0302s_rio', minzoom: 12,
      ...label(['get', 'nombre'], 11, p.river, p.halo, { 'symbol-placement': 'line', 'symbol-spacing': 320 }),
    },
    // calles (urbana): nombre, a zoom alto
    {
      id: 'yv-calle-label', type: 'symbol', source: BTN, 'source-layer': 'btn0622l_urbana', minzoom: 16,
      ...label(['get', 'nombre'], 9.5, p.inkSoft, p.halo, { 'symbol-placement': 'line', 'symbol-spacing': 200 }),
    },
    // iglesias / edificios religiosos (icono + nombre)
    {
      id: 'yv-iglesia', type: 'symbol', source: BTN, 'source-layer': 'btn0516s_edi_rel', minzoom: 14,
      layout: { 'icon-image': 'yv-church', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true },
      paint: { 'text-color': p.inkSoft, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    // construcciones históricas (castillos, torres…) + referencias visuales
    {
      id: 'yv-historico', type: 'symbol', source: BTN, 'source-layer': 'btn0555s_con_his_s', minzoom: 13,
      layout: { 'icon-image': 'yv-castle', 'icon-size': 0.85, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 10, 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-optional': true },
      paint: { 'text-color': p.peak, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    {
      id: 'yv-landmark', type: 'symbol', source: BTN, 'source-layer': 'btn0534s_ref_vis', minzoom: 13,
      layout: { 'icon-image': 'yv-castle', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-optional': true },
      paint: { 'text-color': p.inkSoft, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    // cuevas
    {
      id: 'yv-cueva', type: 'symbol', source: BTN, 'source-layer': 'btn0537p_cueva', minzoom: 13,
      layout: { 'icon-image': 'yv-cave', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true },
      paint: { 'text-color': p.inkSoft, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
    // cascadas
    {
      id: 'yv-cascada', type: 'symbol', source: BTN, 'source-layer': 'btn0337p_cascada', minzoom: 13,
      layout: { 'icon-image': 'yv-water', 'icon-size': 0.8, 'text-field': ['get', 'nombre'], 'text-font': FONT, 'text-size': 9.5, 'text-anchor': 'top', 'text-offset': [0, 0.85], 'text-optional': true },
      paint: { 'text-color': p.river, 'text-halo-color': p.halo, 'text-halo-width': 1.4 },
    },
  ];
}

/** Etiquetas administrativas (CCAA / provincia / municipio) — fuente yv-uadmin. */
export function adminLabelLayers(theme: ThemeName): unknown[] {
  const p = pal(theme);
  return [
    {
      id: 'yv-municipio', type: 'symbol', source: ADM, 'source-layer': 'municipio', minzoom: 9, maxzoom: 14,
      ...label(['get', 'nameunit'], ['interpolate', ['linear'], ['zoom'], 9, 11, 13, 15], p.inkSoft, p.halo, { 'text-max-width': 8 }),
    },
    {
      id: 'yv-provincia', type: 'symbol', source: ADM, 'source-layer': 'provincia', minzoom: 5, maxzoom: 11,
      ...label(['get', 'nameunit'], ['interpolate', ['linear'], ['zoom'], 5, 12, 9, 18], p.ink, p.halo, { 'text-letter-spacing': 0.08, 'text-transform': 'uppercase', 'text-max-width': 9 }),
    },
    {
      id: 'yv-ccaa', type: 'symbol', source: ADM, 'source-layer': 'comunidadautonoma', minzoom: 4, maxzoom: 8,
      ...label(['upcase', ['get', 'nameunit']], ['interpolate', ['linear'], ['zoom'], 4, 13, 8, 22], p.ink, p.halo, { 'text-letter-spacing': 0.12, 'text-max-width': 9 }),
    },
  ];
}

/** Genera en runtime los iconos YourVivac (cumbre, refugio, iglesia, castillo,
 *  cueva, cascada) que piden las symbol layers del calco. */
export function registerTopoIcons(map: MlMap, theme: ThemeName): void {
  const brown = theme === 'dark' ? '#c47a3f' : '#8a5230';
  const blue = theme === 'dark' ? '#6aa6b8' : '#4a7c8c';
  const make = (id: string): ImageData | null => {
    const s = 30;
    const c = document.createElement('canvas');
    c.width = s;
    c.height = s;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = brown;
    const poly = (pts: [number, number][], w = 1.5) => {
      ctx.lineWidth = w;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    switch (id) {
      case 'yv-peak':
        poly([[15, 4], [27, 26], [3, 26]], 2);
        break;
      case 'yv-refuge':
        poly([[15, 4], [27, 14], [23, 14], [23, 26], [7, 26], [7, 14], [3, 14]], 1.6);
        break;
      case 'yv-castle':
        poly([[6, 9], [6, 6], [10, 6], [10, 9], [13, 9], [13, 6], [17, 6], [17, 9], [20, 9], [20, 6], [24, 6], [24, 9], [24, 26], [6, 26]], 1.5);
        break;
      case 'yv-church':
        // cruz + nave con tejado
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(15, 2);
        ctx.lineTo(15, 9);
        ctx.moveTo(12, 4.5);
        ctx.lineTo(18, 4.5);
        ctx.stroke();
        poly([[15, 8], [23, 14], [23, 26], [7, 26], [7, 14]], 1.4);
        break;
      case 'yv-cave':
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, 26);
        ctx.lineTo(5, 16);
        ctx.arc(15, 16, 10, Math.PI, 0, false);
        ctx.lineTo(25, 26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'yv-water':
        ctx.fillStyle = blue;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(15, 4);
        ctx.bezierCurveTo(24, 16, 22, 26, 15, 26);
        ctx.bezierCurveTo(8, 26, 6, 16, 15, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      default:
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
