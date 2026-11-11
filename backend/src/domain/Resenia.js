import { EstadoCompra } from './EstadoCompra.js';
import { ConflictError, ValidationError } from './errors.js';

export class Resenia {
  constructor({ id, compraId, compradorId, eventoId, puntuacion, detalle = '', fecha = new Date() }) {
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new ValidationError('PUNTUACION_INVALIDA', 'La puntuación debe ser un entero entre 1 y 5');
    }
    this.id = id;
    this.compraId = compraId;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.puntuacion = puntuacion;
    this.detalle = detalle;
    this.fecha = new Date(fecha);
  }

  /** Solo se puede reseñar una compra cuya entrada ya fue utilizada. */
  static paraCompra(compra, { puntuacion, detalle, fecha }) {
    if (compra.estado !== EstadoCompra.UTILIZADA) {
      throw new ConflictError(
        'COMPRA_NO_UTILIZADA',
        'Solo se puede reseñar una compra cuya entrada ya fue utilizada',
      );
    }
    return new Resenia({
      compraId: compra.id,
      compradorId: compra.compradorId,
      eventoId: compra.eventoId,
      puntuacion,
      detalle,
      fecha,
    });
  }
}
