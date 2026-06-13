import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

const app = createApp();

describe('app base', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rutas desconocidas devuelven 404', async () => {
    const res = await request(app).get('/api/v1/no-existe');
    expect(res.status).toBe(404);
  });

  it('endpoint no implementado devuelve 501', async () => {
    const res = await request(app).get('/tips'.replace('/tips', '/api/v1/tips'));
    expect(res.status).toBe(501);
  });

  it('ruta protegida sin token devuelve 401', async () => {
    const res = await request(app).get('/api/v1/trips');
    expect(res.status).toBe(401);
  });
});
