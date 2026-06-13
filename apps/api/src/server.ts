import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectMongo } from './db/mongoose.js';
import { initRealtime } from './realtime/index.js';

async function main(): Promise<void> {
  const app = createApp();
  const server = createServer(app);

  initRealtime(server);

  await connectMongo().catch((err) => {
    logger.warn({ err }, 'No se pudo conectar a MongoDB al arrancar (¿está levantado?)');
  });

  server.listen(env.PORT, () => {
    logger.info(`🚀 API escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Apagando servidor…');
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

void main();
