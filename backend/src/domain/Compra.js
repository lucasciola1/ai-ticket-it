import { EstadoCompra, puedeTransicionar } from './EstadoCompra.js';
import { CambioEstadoCompra } from './CambioEstadoCompra.js';
import { Mensaje } from './Mensaje.js';
import { ConflictError } from './errors.js';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export class Compra {
  constructor({
    id,
    compradorId,
    eventoId,
    tipoEntradaId,
    cantidad,
    precioUnitario,
    fechaCompra = new Date(),
    estado = EstadoCompra.PENDIENTE,
    mensajes = [],
    historial,
  }) {
    this.id = id;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.tipoEntradaId = tipoEntradaId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario; // foto del precio al momento de comprar
    this.fechaCompra = new Date(fechaCompra);
    this.estado = estado;
    this.mensajes = mensajes.map((m) => (m instanceof Mensaje ? m : new Mensaje(m)));
    this.historial = historial
      ? historial.map((c) => (c instanceof CambioEstadoCompra ? c : new CambioEstadoCompra(c)))
      : [new CambioEstadoCompra({ estado, quienId: compradorId, fechaHora: this.fechaCompra })];
  }

  get total() {
    return this.cantidad * this.precioUnitario;
  }

  esDe(usuarioId) {
    return this.compradorId === usuarioId;
  }

  actualizarEstado(nuevoEstado, quienId, fechaHora = new Date()) {
    if (!puedeTransicionar(this.estado, nuevoEstado)) {
      throw new ConflictError(
        'TRANSICION_INVALIDA',
        `No se puede pasar una compra de ${this.estado} a ${nuevoEstado}`,
      );
    }
    this.estado = nuevoEstado;
    this.historial.push(new CambioEstadoCompra({ estado: nuevoEstado, quienId, fechaHora }));
  }

  /** Motivo por el que no se puede cancelar, o null si se puede. */
  motivoNoCancelable(evento, ahora = new Date()) {
    if (this.estado === EstadoCompra.UTILIZADA) return 'La compra ya fue utilizada';
    if (![EstadoCompra.PENDIENTE, EstadoCompra.CONFIRMADA].includes(this.estado)) {
      return `La compra ya está ${this.estado}`;
    }
    if (evento.yaOcurrio(ahora)) return 'El evento ya se realizó';
    return null;
  }

  puedeCancelarse(evento, ahora = new Date()) {
    return this.motivoNoCancelable(evento, ahora) === null;
  }

  /**
   * Si no estaba paga queda CANCELADA; si estaba paga, REEMBOLSADA.
   * En ambos casos se libera el cupo del tipo de entrada.
   */
  cancelar(evento, quienId, ahora = new Date()) {
    const motivo = this.motivoNoCancelable(evento, ahora);
    if (motivo) {
      throw new ConflictError('COMPRA_NO_CANCELABLE', motivo);
    }
    const destino =
      this.estado === EstadoCompra.CONFIRMADA ? EstadoCompra.REEMBOLSADA : EstadoCompra.CANCELADA;
    this.actualizarEstado(destino, quienId, ahora);
    evento.buscarTipoEntrada(this.tipoEntradaId).liberar(this.cantidad);
  }

  /** Días que faltan para el evento (0 si es hoy o ya pasó). */
  diasParaEvento(evento, ahora = new Date()) {
    return Math.max(0, Math.ceil((evento.fecha - ahora) / MS_POR_DIA));
  }

  agregarMensaje(autorId, texto, enviado = new Date()) {
    const mensaje = new Mensaje({ autorId, texto, enviado });
    this.mensajes.push(mensaje);
    return mensaje;
  }
}
