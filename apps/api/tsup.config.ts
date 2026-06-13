import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  dts: false,
  sourcemap: true,
  // Empaqueta los packages internos (son TS source) y deja el resto externo.
  noExternal: [/^@yourvivac\//],
});
