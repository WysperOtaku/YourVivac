// Tipos compartidos transversales (subdocumentos, referencias, paginación).

/** Identificador de documento (ObjectId serializado como string en la API). */
export type Id = string;
export type ISODateString = string;

/** Campos comunes a todo documento persistido. */
export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface WithId {
  id: Id;
}

/** Referencia a una imagen subida (Cloudinary). */
export interface MediaRef {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}

export interface PlaceLocation {
  name: string;
  coords?: GeoCoords;
  placeId?: string;
}

/** Respuesta paginada estándar. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

/** Error de la API en forma serializada. */
export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}
