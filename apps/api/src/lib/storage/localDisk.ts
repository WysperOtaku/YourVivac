import { promises as fs } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import type { StorageAdapter, StoredBlob } from './types.js';

/**
 * Adaptador de disco local (desarrollo). Guarda cada blob como un fichero bajo
 * `baseDir`, con un sidecar `<fichero>.ct` que conserva el content-type.
 */
export class LocalDiskAdapter implements StorageAdapter {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = resolve(process.cwd(), baseDir);
  }

  /** Resuelve `key` a una ruta segura dentro de `baseDir` (evita path traversal). */
  private pathFor(key: string): string {
    const safe = key.replace(/\\/g, '/').replace(/\.\.+/g, '').replace(/^\/+/, '');
    const full = resolve(this.baseDir, safe);
    if (full !== this.baseDir && !full.startsWith(this.baseDir + sep)) {
      throw new Error(`Clave de almacenamiento inválida: ${key}`);
    }
    return full;
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    const file = this.pathFor(key);
    await fs.mkdir(dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    await fs.writeFile(`${file}.ct`, contentType, 'utf8');
  }

  async get(key: string): Promise<StoredBlob | null> {
    const file = this.pathFor(key);
    try {
      const body = await fs.readFile(file);
      const contentType = await fs
        .readFile(`${file}.ct`, 'utf8')
        .catch(() => 'application/octet-stream');
      return { body, contentType };
    } catch {
      return null;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.pathFor(key));
      return true;
    } catch {
      return false;
    }
  }

  url(key: string): string {
    // En local no hay URL pública; las teselas se sirven por el proxy de la API.
    return join('/api/v1/maps/tiles', key).replace(/\\/g, '/');
  }

  async delete(key: string): Promise<void> {
    const file = this.pathFor(key);
    await fs.rm(file, { force: true });
    await fs.rm(`${file}.ct`, { force: true });
  }
}
