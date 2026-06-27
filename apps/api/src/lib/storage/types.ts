/**
 * Abstracción de almacenamiento de blobs (teselas de mapa, y a futuro otros
 * binarios). Permite intercambiar disco local (dev) por Azure Blob (prod) sin
 * tocar el resto del código. La media de usuario sigue en Cloudinary (intacta).
 */
export interface StoredBlob {
  body: Buffer;
  contentType: string;
}

export interface StorageAdapter {
  /** Guarda un blob bajo `key` (puede contener `/`, se crean prefijos/carpetas). */
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Devuelve el blob o `null` si no existe. */
  get(key: string): Promise<StoredBlob | null>;
  /** True si existe el blob. */
  exists(key: string): Promise<boolean>;
  /** URL pública directa si el backend la ofrece (Azure); en local, ruta de proxy. */
  url(key: string): string;
  /** Borra el blob (idempotente). */
  delete(key: string): Promise<void>;
}
