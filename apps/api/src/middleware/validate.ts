import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Middleware de validación Zod. Acepta:
 *  - un esquema "completo" `{ body, params, query }` (de `requestSchema`), o
 *  - un esquema simple que valida sólo `req.body`.
 * Sustituye los valores por los parseados (coerción/defaults aplicados).
 */
export function validate(schema: ZodTypeAny, target: 'body' | 'params' | 'query' | 'all' = 'body'): RequestHandler {
  return (req, _res, next) => {
    try {
      if (target === 'all') {
        const parsed = schema.parse({ body: req.body, params: req.params, query: req.query }) as {
          body?: unknown;
          params?: unknown;
          query?: unknown;
        };
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;
        if (parsed.query !== undefined) Object.assign(req.query, parsed.query);
      } else {
        const parsed = schema.parse(req[target]);
        if (target === 'body') req.body = parsed;
        else if (target === 'query') Object.assign(req.query, parsed);
        else req.params = parsed as typeof req.params;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
