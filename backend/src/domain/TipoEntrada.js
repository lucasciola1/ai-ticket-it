import { randomUUID } from 'node:crypto';
import { ConflictError } from './errors.js';

export class TipoEntrada {
  constructor({ id = randomUUID(), nombre, descripcion = '', precio, cupo, vendidas = 0 }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupo = cupo;
    this.vendidas = vendidas;
  }

  disponibles() {
    return this.cupo - this.vendidas;
  }

  hayCupoPara(cantidad) {
    return cantidad > 0 && cantidad <= this.disponibles();
  }

  reservar(cantidad) {
    if (!this.hayCupoPara(cantidad)) {
      throw new ConflictError(
        'SIN_CUPO',
        `No hay cupo suficiente para ${cantidad} entrada(s) ${this.nombre} (quedan ${this.disponibles()})`,
      );
    }
    this.vendidas += cantidad;
  }

  liberar(cantidad) {
    this.vendidas = Math.max(0, this.vendidas - cantidad);
  }
}
