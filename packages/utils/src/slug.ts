// Generación de slugs URL-safe a partir de texto (con soporte de acentos).

// Rango de marcas diacríticas combinantes U+0300–U+036F (construido por código
// para no depender de bytes literales en el archivo fuente).
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Normaliza una cadena a slug: minúsculas, sin acentos, separada por guiones. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(DIACRITICS, '') // quita diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Añade un sufijo corto único a un slug base (para evitar colisiones). */
export function uniqueSlug(base: string, suffix?: string): string {
  const root = slugify(base);
  const tail = suffix ?? Math.random().toString(36).slice(2, 8);
  return `${root}-${tail}`;
}
