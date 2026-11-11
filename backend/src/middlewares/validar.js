/**
 * Valida body / query / params con schemas de Zod.
 * Los datos ya parseados quedan en req.validated (en Express 5 req.query es de solo lectura).
 * Si algo no valida, Zod lanza un ZodError que atrapa el errorHandler.
 */
export function validar({ body, query, params } = {}) {
  return (req, res, next) => {
    req.validated = {
      body: body ? body.parse(req.body ?? {}) : req.body,
      query: query ? query.parse(req.query) : req.query,
      params: params ? params.parse(req.params) : req.params,
    };
    next();
  };
}
