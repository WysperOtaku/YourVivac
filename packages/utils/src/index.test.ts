import { describe, it, expect } from 'vitest';
import {
  totalWeight,
  formatWeight,
  slugify,
  formatDistance,
  formatElevation,
  fingerprint,
  tokenSetSimilarity,
  daysBetween,
  readingMinutes,
} from './index.js';

describe('totalWeight', () => {
  it('suma el peso de los ítems en gramos', () => {
    expect(totalWeight([{ weightGrams: 1180 }, { weightGrams: 480 }])).toBe(1660);
  });
  it('ignora ítems sin peso', () => {
    expect(totalWeight([{ weightGrams: 100 }, {}])).toBe(100);
  });
  it('devuelve 0 para lista vacía', () => {
    expect(totalWeight([])).toBe(0);
  });
});

describe('formatWeight', () => {
  it('muestra gramos por debajo de 1kg', () => {
    expect(formatWeight(480)).toBe('480 g');
  });
  it('muestra kg redondos sin decimales', () => {
    expect(formatWeight(2000)).toBe('2 kg');
  });
  it('muestra kg con dos decimales', () => {
    expect(formatWeight(1660)).toBe('1.66 kg');
  });
});

describe('slugify', () => {
  it('normaliza acentos y espacios', () => {
    expect(slugify('Vivac en el Aneto')).toBe('vivac-en-el-aneto');
  });
  it('quita diacríticos', () => {
    expect(slugify('Ruta más difícil')).toBe('ruta-mas-dificil');
  });
});

describe('units', () => {
  it('formatea distancia métrica', () => {
    expect(formatDistance(12)).toBe('12 km');
    expect(formatDistance(12.5)).toBe('12.5 km');
  });
  it('formatea distancia imperial', () => {
    expect(formatDistance(10, 'imperial')).toBe('6.2 mi');
  });
  it('formatea desnivel', () => {
    expect(formatElevation(1200)).toBe('1200 m');
    expect(formatElevation(1000, 'imperial')).toBe('3281 ft');
  });
});

describe('product matching', () => {
  it('genera huellas iguales para variantes equivalentes', () => {
    const a = fingerprint({ brand: 'Trangoworld', model: 'Winter -5' });
    const b = fingerprint({ brand: 'trangoworld', model: '-5 winter' });
    expect(a).toBe(b);
  });
  it('similitud alta para nombres parecidos', () => {
    const sim = tokenSetSimilarity(
      'Saco Trangoworld Winter -5',
      'Trangoworld Saco de dormir Winter -5',
    );
    expect(sim).toBeGreaterThan(0.5);
  });
});

describe('date', () => {
  it('cuenta días entre fechas', () => {
    expect(daysBetween('2026-06-12', '2026-06-14')).toBe(2);
  });
  it('estima minutos de lectura', () => {
    expect(readingMinutes('palabra '.repeat(400))).toBe(2);
  });
});
