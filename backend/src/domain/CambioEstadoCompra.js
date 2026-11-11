export class CambioEstadoCompra {
  constructor({ estado, quienId, fechaHora = new Date() }) {
    this.estado = estado;
    this.quienId = quienId;
    this.fechaHora = new Date(fechaHora);
  }
}
