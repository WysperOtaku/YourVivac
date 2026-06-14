/** Convierte un documento Mongoose a JSON de API: `_id`→`id`, sin `__v`/`passwordHash`. */
export function serializeDoc<T = Record<string, unknown>>(doc: unknown): T {
  if (doc == null) return doc as T;
  const obj =
    typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : ({ ...(doc as Record<string, unknown>) } as Record<string, unknown>);
  if (obj._id != null) {
    obj.id = String(obj._id);
    delete obj._id;
  }
  delete obj.__v;
  delete obj.passwordHash;
  return obj as T;
}

export function serializeDocs<T = Record<string, unknown>>(docs: unknown[]): T[] {
  return docs.map((d) => serializeDoc<T>(d));
}
