import { TipoEntrada } from './TipoEntrada.js';
import { NotFoundError } from './errors.js';

/** Minúsculas y sin tildes, para que "teatro" encuentre "Teátro". */
const normalizar = (texto = '') =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export class Evento {
  constructor({
    id,
    nombre,
    descripcion = '',
    categoriaId,
    fecha,
    lugar = '',
    multimedia = [],
    organizadorId,
    tiposEntrada = [],
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoriaId = categoriaId;
    this.fecha = new Date(fecha);
    this.lugar = lugar;
    this.multimedia = [...multimedia];
    this.organizadorId = organizadorId;
    this.tiposEntrada = tiposEntrada.map((t) => (t instanceof TipoEntrada ? t : new TipoEntrada(t)));
  }

  esOrganizadoPor(usuarioId) {
    return this.organizadorId === usuarioId;
  }

  yaOcurrio(ahora = new Date()) {
    return this.fecha <= ahora;
  }

  precioMinimo() {
    return Math.min(...this.tiposEntrada.map((t) => t.precio));
  }

  /** Verdadero si algún tipo de entrada tiene un precio dentro del rango. */
  tuPrecioEstaEntre(min = 0, max = Infinity) {
    return this.tiposEntrada.some((t) => t.precio >= min && t.precio <= max);
  }

  coincideCon(texto) {
    const buscado = normalizar(texto.trim());
    return [this.nombre, this.descripcion, this.lugar].some((campo) =>
      normalizar(campo).includes(buscado),
    );
  }

  buscarTipoEntrada(tipoEntradaId) {
    const tipo = this.tiposEntrada.find((t) => t.id === tipoEntradaId);
    if (!tipo) {
      throw new NotFoundError(
        'TIPO_ENTRADA_NO_ENCONTRADO',
        'El tipo de entrada no existe en este evento',
      );
    }
    return tipo;
  }
}
