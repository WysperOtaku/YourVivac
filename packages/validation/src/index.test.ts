import { describe, it, expect } from 'vitest';
import { registerSchema, createTripSchema, createPinSchema } from './index.js';

describe('registerSchema', () => {
  it('acepta un registro válido', () => {
    const r = registerSchema.safeParse({
      displayName: 'Marcos Vidal',
      username: 'marcosvidal',
      email: 'marcos@example.com',
      password: 'supersecret',
    });
    expect(r.success).toBe(true);
  });
  it('rechaza email inválido', () => {
    const r = registerSchema.safeParse({
      displayName: 'M',
      username: 'm',
      email: 'no-email',
      password: '123',
    });
    expect(r.success).toBe(false);
  });
});

describe('createTripSchema', () => {
  const base = {
    title: 'Vivac en el Aneto',
    startDate: '2026-06-12T00:00:00.000Z',
    endDate: '2026-06-14T00:00:00.000Z',
    location: { name: 'Aneto', coords: { lat: 42.63, lng: 0.65 } },
    difficulty: 'alpina',
    visibility: 'private',
  };
  it('acepta una salida válida', () => {
    expect(createTripSchema.safeParse(base).success).toBe(true);
  });
  it('rechaza endDate anterior a startDate', () => {
    const r = createTripSchema.safeParse({ ...base, endDate: '2026-06-10T00:00:00.000Z' });
    expect(r.success).toBe(false);
  });
});

describe('createPinSchema (unión discriminada)', () => {
  const layout = { x: 10, y: 20 };
  it('valida un pin de nota', () => {
    const r = createPinSchema.safeParse({ type: 'note', layout, note: { markdown: '# Hola' } });
    expect(r.success).toBe(true);
  });
  it('rechaza payload de tipo equivocado', () => {
    const r = createPinSchema.safeParse({ type: 'note', layout, link: { url: 'https://x.com' } });
    expect(r.success).toBe(false);
  });
  it('valida un pin de mapa', () => {
    const r = createPinSchema.safeParse({
      type: 'map',
      layout,
      map: { label: 'Refugio', coords: { lat: 42.6, lng: 0.6 } },
    });
    expect(r.success).toBe(true);
  });
});
