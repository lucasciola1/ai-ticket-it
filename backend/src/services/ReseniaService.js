import { Resenia } from '../domain/Resenia.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../domain/errors.js';
import { toReseniaDTO } from '../mappers/reseniaMapper.js';
import { toUsuarioPublicoDTO } from '../mappers/usuarioMapper.js';

export const SIN_RESENIAS = Object.freeze({ promedio: null, cantidad: 0 });

const redondear = (n) => Math.round(n * 10) / 10;

export class ReseniaService {
  constructor({ reseniaRepository, eventoRepository, compraRepository, usuarioRepository, ahora = () => new Date() }) {
    this.reseniaRepository = reseniaRepository;
    this.eventoRepository = eventoRepository;
    this.compraRepository = compraRepository;
    this.usuarioRepository = usuarioRepository;
    this.ahora = ahora;
  }

  /** Reputación de todos los organizadores con reseñas: Map organizadorId → { promedio, cantidad }. */
  reputaciones() {
    const sumas = new Map();
    for (const resenia of this.reseniaRepository.findAll()) {
      const evento = this.eventoRepository.findById(resenia.eventoId);
      if (!evento) continue;
      const actual = sumas.get(evento.organizadorId) ?? { total: 0, cantidad: 0 };
      sumas.set(evento.organizadorId, {
        total: actual.total + resenia.puntuacion,
        cantidad: actual.cantidad + 1,
      });
    }
    return new Map(
      [...sumas].map(([id, { total, cantidad }]) => [id, { promedio: redondear(total / cantidad), cantidad }]),
    );
  }

  reputacionDe(organizadorId) {
    return this.reputaciones().get(organizadorId) ?? SIN_RESENIAS;
  }

  /** Reseñas de todos los eventos de un organizador, las más nuevas primero. */
  deOrganizador(organizadorId) {
    const organizador = this.usuarioRepository.findById(organizadorId);
    if (!organizador) {
      throw new NotFoundError('ORGANIZADOR_NO_ENCONTRADO', 'El organizador no existe');
    }
    const eventos = this.eventoRepository.findByOrganizador(organizadorId);
    const eventosPorId = new Map(eventos.map((e) => [e.id, e]));
    const resenias = this.reseniaRepository
      .findByEventos(eventosPorId.keys())
      .sort((a, b) => b.fecha - a.fecha)
      .map((r) =>
        toReseniaDTO(r, {
          evento: eventosPorId.get(r.eventoId),
          comprador: this.usuarioRepository.findById(r.compradorId),
        }),
      );
    return {
      organizador: toUsuarioPublicoDTO(organizador),
      ...this.reputacionDe(organizadorId),
      resenias,
    };
  }

  crear(compraId, usuario, { puntuacion, detalle }) {
    const compra = this.compraRepository.findById(compraId);
    if (!compra) {
      throw new NotFoundError('COMPRA_NO_ENCONTRADA', 'La compra no existe');
    }
    if (!compra.esDe(usuario.id)) {
      throw new ForbiddenError('SOLO_COMPRADOR', 'Solo quien hizo la compra puede reseñarla');
    }
    if (this.reseniaRepository.findByCompra(compra.id)) {
      throw new ConflictError('RESENIA_EXISTENTE', 'Ya dejaste una reseña para esta compra');
    }
    const resenia = this.reseniaRepository.save(
      Resenia.paraCompra(compra, { puntuacion, detalle, fecha: this.ahora() }),
    );
    return toReseniaDTO(resenia, { evento: this.eventoRepository.findById(compra.eventoId) });
  }
}
