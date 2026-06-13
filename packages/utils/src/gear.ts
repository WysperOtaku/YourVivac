// Helpers de listas de equipo (peso de mochila).

export interface WeighedItem {
  weightGrams?: number;
}

/** Suma el peso (en gramos) de los ítems, ignorando los que no tienen peso. */
export function totalWeight(items: WeighedItem[]): number {
  return items.reduce((sum, item) => sum + (item.weightGrams ?? 0), 0);
}

/** Convierte gramos a una etiqueta legible (g / kg). */
export function formatWeight(grams: number): string {
  if (grams < 1000) return `${grams} g`;
  const kg = grams / 1000;
  return `${kg.toFixed(kg % 1 === 0 ? 0 : 2)} kg`;
}
