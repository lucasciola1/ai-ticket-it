import { ZodError } from 'zod';
import { AppError } from '../domain/errors.js';

const responderError = (res, status, codigo, mensaje, detalles = []) =>
  res.status(status).json({ error: { codigo, mensaje, detalles } });

/** Rutas que no existen. Va después de todas las rutas. */
export function notFoundHandler(req, res) {
  responderError(res, 404, 'RUTA_NO_ENCONTRADA', `No existe ${req.method} ${req.path}`);
}

/**
 * Traduce cualquier error a una respuesta JSON con formato uniforme:
 * { error: { codigo, mensaje, detalles } }. Va último en app.js.
 */
// eslint-disable-next-line no-unused-vars -- Express reconoce el handler de errores por sus 4 parámetros
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const detalles = err.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensaje: issue.message,
    }));
    return responderError(res, 400, 'VALIDACION', 'Hay datos inválidos en la solicitud', detalles);
  }

  // Body con JSON mal formado (lo lanza express.json)
  if (err.type === 'entity.parse.failed') {
    return responderError(res, 400, 'JSON_INVALIDO', 'El cuerpo de la solicitud no es un JSON válido');
  }

  if (err instanceof AppError) {
    return responderError(res, err.statusCode, err.codigo, err.message, err.detalles);
  }

  console.error(err);
  return responderError(res, 500, 'ERROR_INTERNO', 'Ocurrió un error inesperado');
}
