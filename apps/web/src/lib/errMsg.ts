/** Extrae el mensaje de error de una respuesta Axios de la API (o un fallback). */
export function errMsg(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
}
