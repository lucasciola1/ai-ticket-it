import { Evento } from '../domain/Evento.js';
import { NotFoundError, ValidationError } from '../domain/errors.js';
import { toEventoDetalleDTO, toEventoResumenDTO } from '../mappers/eventoMapper.js';
import { SIN_RESENIAS } from './ReseniaService.js';

/** Ordena ascendente o descendente, dejando siempre los null al final. */
const comparar = (a, b, dir) => {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir === 'asc' ? a - b : b - a;
};

export class EventoService {
  constructor({
    eventoRepository,
    categoriaRepository,
    usuarioRepository,
    reseniaService,
    ahora = () => new Date(),
  }) {
    this.eventoRepository = eventoRepository;
    this.categoriaRepository = categoriaRepository;
    this.usuarioRepository = usuarioRepository;
    this.reseniaService = reseniaService;
    this.ahora = ahora;
  }

  buscar({ q, categoriaId, precioMin, precioMax, orden, dir, page, limit }, usuario) {
    const ahora = this.ahora();
    const reputaciones = this.reseniaService.reputaciones();
    const filtraPrecio = precioMin !== undefined || precioMax !== undefined;

    const eventos = this.eventoRepository.findMany(
      (e) =>
        !e.yaOcurrio(ahora) &&
        (!q || e.coincideCon(q)) &&
        (!categoriaId || e.categoriaId === categoriaId) &&
        (!filtraPrecio || e.tuPrecioEstaEntre(precioMin ?? 0, precioMax ?? Infinity)),
    );

    const direccion = dir ?? (orden === 'puntaje' ? 'desc' : 'asc');
    const clave = {
      precio: (e) => e.precioMinimo(),
      fecha: (e) => e.fecha.getTime(),
      puntaje: (e) => reputaciones.get(e.organizadorId)?.promedio ?? null,
    }[orden];
    eventos.sort((a, b) => comparar(clave(a), clave(b), direccion) || a.fecha - b.fecha);

    const total = eventos.length;
    const pagina = eventos.slice((page - 1) * limit, page * limit);
    return {
      items: this.#resumenes(pagina, usuario, reputaciones),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  obtener(eventoId, usuario) {
    const evento = this.buscarPorId(eventoId);
    return toEventoDetalleDTO(evento, this.#contexto(evento, usuario, this.reseniaService.reputaciones()));
  }

  crear(organizador, datos) {
    if (!this.categoriaRepository.findById(datos.categoriaId)) {
      throw new ValidationError('CATEGORIA_INEXISTENTE', 'La categoría no existe');
    }
    const evento = this.eventoRepository.save(new Evento({ ...datos, organizadorId: organizador.id }));
    return this.obtener(evento.id, organizador);
  }

  /** Eventos que organiza el usuario (incluye los ya realizados). */
  deOrganizador(usuario) {
    const eventos = this.eventoRepository
      .findByOrganizador(usuario.id)
      .sort((a, b) => a.fecha - b.fecha);
    return this.#resumenes(eventos, usuario);
  }

  favoritosDe(usuario) {
    const eventos = usuario.favoritos
      .map((id) => this.eventoRepository.findById(id))
      .filter(Boolean);
    return this.#resumenes(eventos, usuario);
  }

  marcarFavorito(usuario, eventoId) {
    this.buscarPorId(eventoId);
    usuario.agregarFavorito(eventoId);
    this.usuarioRepository.save(usuario);
    return { favoritos: [...usuario.favoritos] };
  }

  desmarcarFavorito(usuario, eventoId) {
    usuario.quitarFavorito(eventoId);
    this.usuarioRepository.save(usuario);
    return { favoritos: [...usuario.favoritos] };
  }

  buscarPorId(eventoId) {
    const evento = this.eventoRepository.findById(eventoId);
    if (!evento) {
      throw new NotFoundError('EVENTO_NO_ENCONTRADO', 'El evento no existe');
    }
    return evento;
  }

  #resumenes(eventos, usuario, reputaciones = this.reseniaService.reputaciones()) {
    return eventos.map((e) => toEventoResumenDTO(e, this.#contexto(e, usuario, reputaciones)));
  }

  #contexto(evento, usuario, reputaciones) {
    return {
      categoria: this.categoriaRepository.findById(evento.categoriaId),
      organizador: this.usuarioRepository.findById(evento.organizadorId),
      reputacion: reputaciones.get(evento.organizadorId) ?? SIN_RESENIAS,
      usuario,
      ahora: this.ahora(),
    };
  }
}
