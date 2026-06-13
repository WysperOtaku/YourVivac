// Huella (fingerprint) de producto para matching difuso del agregador.
// Identidad débil cuando no hay EAN/UPC/GTIN (Guía del agregador §9).

import { slugify } from './slug.js';

const STOPWORDS = new Set(['de', 'la', 'el', 'para', 'con', 'and', 'the', 'of']);

/** Tokeniza y normaliza un nombre de producto a un conjunto ordenado de tokens. */
export function tokenize(text: string): string[] {
  return slugify(text)
    .split('-')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .sort();
}

/** Genera una huella estable a partir de marca + modelo + atributos. */
export function fingerprint(parts: { brand?: string; model?: string; specs?: string[] }): string {
  const tokens = new Set<string>();
  if (parts.brand) tokenize(parts.brand).forEach((t) => tokens.add(t));
  if (parts.model) tokenize(parts.model).forEach((t) => tokens.add(t));
  parts.specs?.forEach((s) => tokenize(s).forEach((t) => tokens.add(t)));
  return Array.from(tokens).sort().join('-');
}

/** Similitud de Jaccard (token-set) entre dos textos: 0..1. */
export function tokenSetSimilarity(a: string, b: string): number {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  if (sa.size === 0 && sb.size === 0) return 1;
  let intersection = 0;
  for (const t of sa) if (sb.has(t)) intersection++;
  const union = sa.size + sb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
