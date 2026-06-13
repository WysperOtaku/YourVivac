// Formato de fechas y rangos (ligero, sin dependencias).

/** Devuelve el rango de una salida en formato corto es-ES (ej. "12–14 jun"). */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' });
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${month.format(e)}`;
  }
  const fmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

/** Diferencia en días (redondeada hacia arriba) entre dos fechas. */
export function daysBetween(start: Date | string, end: Date | string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Estima minutos de lectura a partir del contenido (≈200 ppm). */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
