import { describe, it, expect, beforeAll } from 'vitest';
import style from './yv-topo-style.json';

// maplibre-gl ejecuta `URL.createObjectURL` al importarse (para el worker); jsdom
// no lo implementa. Lo stubeamos para poder comprobar que el módulo bundlea, sin
// renderizar el mapa (no hay WebGL en jsdom).
beforeAll(() => {
  if (typeof URL.createObjectURL !== 'function') {
    URL.createObjectURL = () => 'blob:yv-test';
  }
});

// No renderizamos MapLibre en jsdom (no hay WebGL). Validamos el contrato del
// style YourVivac y que el módulo del componente importa/bundlea sin romper.
describe('yv-topo-style.json', () => {
  it('es un style MapLibre v8 con la source raster esperada', () => {
    expect(style.version).toBe(8);
    const source = style.sources['yv-topo'];
    expect(source).toBeDefined();
    expect(source.type).toBe('raster');
    expect(Array.isArray(source.tiles)).toBe(true);
    expect(source.tiles[0]).toContain('/maps/tiles/');
    expect(source.tileSize).toBe(256);
  });

  it('incluye capa de fondo y capa raster', () => {
    const ids = style.layers.map((l) => l.id);
    expect(ids).toContain('yv-background');
    expect(ids).toContain('yv-topo-raster');
  });
});

describe('TopoMapLibre (módulo)', () => {
  it('importa y exporta el componente y su interfaz de props', async () => {
    const mod = await import('./TopoMapLibre');
    expect(typeof mod.TopoMapLibre).toBe('function');
  });
});
