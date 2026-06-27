import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AzureBlobAdapter } from './azureBlob.js';
import { LocalDiskAdapter } from './localDisk.js';
import type { StorageAdapter } from './types.js';

export type { StorageAdapter, StoredBlob } from './types.js';

/** Crea el adaptador de almacenamiento según `STORAGE_DRIVER`. */
export function createStorage(): StorageAdapter {
  if (env.STORAGE_DRIVER === 'azure') {
    if (!env.AZURE_STORAGE_CONNECTION_STRING) {
      logger.warn('STORAGE_DRIVER=azure sin AZURE_STORAGE_CONNECTION_STRING; usando disco local.');
      return new LocalDiskAdapter(env.STORAGE_LOCAL_DIR);
    }
    return new AzureBlobAdapter(env.AZURE_STORAGE_CONNECTION_STRING, env.AZURE_BLOB_CONTAINER);
  }
  return new LocalDiskAdapter(env.STORAGE_LOCAL_DIR);
}

/** Singleton de almacenamiento (teselas de mapa y otros blobs). */
export const storage: StorageAdapter = createStorage();
