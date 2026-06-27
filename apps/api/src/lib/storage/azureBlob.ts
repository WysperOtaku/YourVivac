import type { ContainerClient } from '@azure/storage-blob';
import type { StorageAdapter, StoredBlob } from './types.js';

/**
 * Adaptador de Azure Blob Storage (producción). El cliente se inicializa de
 * forma perezosa para no requerir la cadena de conexión salvo cuando se usa.
 */
export class AzureBlobAdapter implements StorageAdapter {
  private container: ContainerClient | null = null;
  private ready: Promise<ContainerClient> | null = null;

  constructor(
    private readonly connectionString: string,
    private readonly containerName: string,
  ) {}

  private async getContainer(): Promise<ContainerClient> {
    if (this.container) return this.container;
    if (!this.ready) {
      this.ready = (async () => {
        const { BlobServiceClient } = await import('@azure/storage-blob');
        const service = BlobServiceClient.fromConnectionString(this.connectionString);
        const container = service.getContainerClient(this.containerName);
        await container.createIfNotExists({ access: 'blob' });
        this.container = container;
        return container;
      })();
    }
    return this.ready;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    const container = await this.getContainer();
    const block = container.getBlockBlobClient(key);
    await block.uploadData(body, { blobHTTPHeaders: { blobContentType: contentType } });
  }

  async get(key: string): Promise<StoredBlob | null> {
    const container = await this.getContainer();
    const block = container.getBlockBlobClient(key);
    try {
      const body = await block.downloadToBuffer();
      const props = await block.getProperties();
      return { body, contentType: props.contentType ?? 'application/octet-stream' };
    } catch {
      return null;
    }
  }

  async exists(key: string): Promise<boolean> {
    const container = await this.getContainer();
    return container.getBlockBlobClient(key).exists();
  }

  url(key: string): string {
    return this.container
      ? this.container.getBlockBlobClient(key).url
      : `/api/v1/maps/tiles/${key}`;
  }

  async delete(key: string): Promise<void> {
    const container = await this.getContainer();
    await container.getBlockBlobClient(key).deleteIfExists();
  }
}
