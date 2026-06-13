import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

mongoose.set('strictQuery', true);

export async function connectMongo(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  await mongoose.connect(uri);
  logger.info('✅ MongoDB conectado');
  return mongoose;
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export { mongoose };
