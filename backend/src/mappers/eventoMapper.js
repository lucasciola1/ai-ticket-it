import { toUsuarioPublicoDTO } from './usuarioMapper.js';

export const toTipoEntradaDTO = (tipo) => ({
  id: tipo.id,
  nombre: tipo.nombre,
  descripcion: tipo.descripcion,
  precio: tipo.precio,
  cupo: tipo.cupo,
  vendidas: tipo.vendidas,
  disponibles: tipo.disponibles(),
  agotado: tipo.disponibles() === 0,
});

export const toOrganizadorDTO = (organizador, reputacion) => ({
  ...toUsuarioPublicoDTO(organizador),
  puntaje: reputacion.promedio,
  cantidadResenias: reputacion.cantidad,
});

/** Para listados (búsqueda, favoritos, mis eventos). */
export const toEventoResumenDTO = (evento, { categoria, organizador, reputacion, usuario, ahora }) => ({
  id: evento.id,
  nombre: evento.nombre,
  fecha: evento.fecha,
  lugar: evento.lugar,
  imagen: evento.multimedia[0] ?? null,
  categoria: categoria ? { id: categoria.id, nombre: categoria.nombre } : null,
  precioMinimo: evento.precioMinimo(),
  organizador: toOrganizadorDTO(organizador, reputacion),
  finalizado: evento.yaOcurrio(ahora),
  agotado: evento.tiposEntrada.every((t) => t.disponibles() === 0),
  esFavorito: usuario ? usuario.esFavorito(evento.id) : false,
});

export const toEventoDetalleDTO = (evento, contexto) => ({
  ...toEventoResumenDTO(evento, contexto),
  descripcion: evento.descripcion,
  multimedia: [...evento.multimedia],
  tiposEntrada: evento.tiposEntrada.map(toTipoEntradaDTO),
  esOrganizador: contexto.usuario ? evento.esOrganizadoPor(contexto.usuario.id) : false,
});
