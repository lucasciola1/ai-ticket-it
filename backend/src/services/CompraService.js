import { Compra } from '../domain/Compra.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../domain/errors.js';
import { toCompraDTO, toMensajeDTO } from '../mappers/compraMapper.js';
import { toTipoEntradaDTO } from '../mappers/eventoMapper.js';

const masNuevasPrimero = (a, b) => b.fechaCompra - a.fechaCompra;

export class CompraService {
  constructor({
    compraRepository,
    eventoRepository,
    usuarioRepository,
    reseniaRepository,
    ahora = () => new Date(),
  }) {
    this.compraRepository = compraRepository;
    this.eventoRepository = eventoRepository;
    this.usuarioRepository = usuarioRepository;
    this.reseniaRepository = reseniaRepository;
    this.ahora = ahora;
  }

  crear(comprador, { eventoId, tipoEntradaId, cantidad }) {
    const ahora = this.ahora();
    const evento = this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError('EVENTO_NO_ENCONTRADO', 'El evento no existe');
    }
    if (evento.esOrganizadoPor(comprador.id)) {
      throw new ForbiddenError('PROPIO_EVENTO', 'No podés comprar entradas de tu propio evento');
    }
    if (evento.yaOcurrio(ahora)) {
      throw new ValidationError('EVENTO_FINALIZADO', 'El evento ya se realizó');
    }

    const tipo = evento.buscarTipoEntrada(tipoEntradaId);
    tipo.reservar(cantidad); // lanza SIN_CUPO si no alcanza

    const compra = this.compraRepository.save(
      new Compra({
        compradorId: comprador.id,
        eventoId: evento.id,
        tipoEntradaId: tipo.id,
        cantidad,
        precioUnitario: tipo.precio,
        fechaCompra: ahora,
      }),
    );
    this.eventoRepository.save(evento);
    return this.#dto(compra, evento, 'comprador', { detalle: true });
  }

  deComprador(usuario) {
    return this.compraRepository
      .findByComprador(usuario.id)
      .sort(masNuevasPrimero)
      .map((c) => this.#dto(c, this.eventoRepository.findById(c.eventoId), 'comprador'));
  }

  /** Vista del organizador: compras del evento, resumen por estado y disponibilidad por tipo. */
  delEvento(eventoId, usuario, { estado } = {}) {
    const evento = this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError('EVENTO_NO_ENCONTRADO', 'El evento no existe');
    }
    if (!evento.esOrganizadoPor(usuario.id)) {
      throw new ForbiddenError('SOLO_ORGANIZADOR', 'Solo el organizador puede ver las compras de este evento');
    }

    const compras = this.compraRepository.findByEvento(evento.id);
    const resumenPorEstado = Object.fromEntries(Object.values(EstadoCompra).map((e) => [e, 0]));
    compras.forEach((c) => resumenPorEstado[c.estado]++);

    return {
      evento: {
        id: evento.id,
        nombre: evento.nombre,
        fecha: evento.fecha,
        lugar: evento.lugar,
        finalizado: evento.yaOcurrio(this.ahora()),
      },
      tiposEntrada: evento.tiposEntrada.map(toTipoEntradaDTO),
      resumenPorEstado,
      compras: compras
        .filter((c) => !estado || c.estado === estado)
        .sort(masNuevasPrimero)
        .map((c) => this.#dto(c, evento, 'organizador')),
    };
  }

  obtener(compraId, usuario) {
    const { compra, evento } = this.#cargar(compraId);
    return this.#dto(compra, evento, this.#rolDe(usuario, compra, evento), { detalle: true });
  }

  pagar(compraId, usuario) {
    return this.#accion(compraId, usuario, 'comprador', ({ compra, evento, ahora }) => {
      if (evento.yaOcurrio(ahora)) {
        throw new ConflictError('EVENTO_FINALIZADO', 'El evento ya se realizó');
      }
      compra.actualizarEstado(EstadoCompra.CONFIRMADA, usuario.id, ahora);
    });
  }

  cancelar(compraId, usuario) {
    return this.#accion(compraId, usuario, 'comprador', ({ compra, evento, ahora }) => {
      compra.cancelar(evento, usuario.id, ahora); // también libera el cupo del evento
    });
  }

  utilizar(compraId, usuario) {
    return this.#accion(compraId, usuario, 'organizador', ({ compra, ahora }) => {
      compra.actualizarEstado(EstadoCompra.UTILIZADA, usuario.id, ahora);
    });
  }

  mensajes(compraId, usuario) {
    const { compra, evento } = this.#cargar(compraId);
    this.#rolDe(usuario, compra, evento);
    return compra.mensajes.map((m) => this.#mensajeDTO(m, evento));
  }

  enviarMensaje(compraId, usuario, texto) {
    const { compra, evento } = this.#cargar(compraId);
    this.#rolDe(usuario, compra, evento);
    const mensaje = compra.agregarMensaje(usuario.id, texto, this.ahora());
    this.compraRepository.save(compra);
    return this.#mensajeDTO(mensaje, evento);
  }

  // ---------- privados ----------

  #cargar(compraId) {
    const compra = this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError('COMPRA_NO_ENCONTRADA', 'La compra no existe');
    }
    return { compra, evento: this.eventoRepository.findById(compra.eventoId) };
  }

  /** 'comprador' u 'organizador'; cualquier otro usuario no tiene acceso. */
  #rolDe(usuario, compra, evento) {
    if (compra.esDe(usuario.id)) return 'comprador';
    if (evento.esOrganizadoPor(usuario.id)) return 'organizador';
    throw new ForbiddenError('SIN_ACCESO', 'No tenés acceso a esta compra');
  }

  /** Carga la compra, exige el rol, aplica el cambio, guarda y devuelve el detalle. */
  #accion(compraId, usuario, rolRequerido, cambio) {
    const { compra, evento } = this.#cargar(compraId);
    const rol = this.#rolDe(usuario, compra, evento);
    if (rol !== rolRequerido) {
      throw new ForbiddenError(
        rolRequerido === 'comprador' ? 'SOLO_COMPRADOR' : 'SOLO_ORGANIZADOR',
        `Solo el ${rolRequerido} puede realizar esta acción`,
      );
    }
    cambio({ compra, evento, ahora: this.ahora() });
    this.compraRepository.save(compra);
    this.eventoRepository.save(evento);
    return this.#dto(compra, evento, rol, { detalle: true });
  }

  #dto(compra, evento, rol, { detalle = false } = {}) {
    return toCompraDTO(compra, {
      evento,
      rol,
      comprador: this.usuarioRepository.findById(compra.compradorId),
      resenia: this.reseniaRepository.findByCompra(compra.id),
      ahora: this.ahora(),
      buscarUsuario: detalle ? (id) => this.usuarioRepository.findById(id) : undefined,
    });
  }

  #mensajeDTO(mensaje, evento) {
    return toMensajeDTO(mensaje, { autor: this.usuarioRepository.findById(mensaje.autorId), evento });
  }
}
