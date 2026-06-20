/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Destino del proxy de API/sockets. En docker se pasa API_PROXY_TARGET=http://api:4000;
// en local apunta al API publicado. El navegador siempre habla con su MISMO origen
// (ruta relativa /api), y el servidor web reenvía aquí — así no se hornea ningún host.
const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:4000';
// socket.io valida el Origin en el handshake (lado servidor). Como el cliente remoto
// llega con un Origin variable (su IP), lo reescribimos a uno fijo y permitido por
// CORS_ORIGINS del API. Para /api no hace falta (el navegador lo ve como same-origin).
const proxyOrigin = process.env.WEB_PROXY_ORIGIN || 'http://localhost:8080';
const proxy = {
  '/api': { target: apiProxyTarget, changeOrigin: true },
  '/socket.io': {
    target: apiProxyTarget,
    changeOrigin: true,
    ws: true,
    headers: { origin: proxyOrigin },
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { port: 5173, proxy },
  preview: { port: 8080, proxy },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
