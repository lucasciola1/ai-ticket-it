import { EstadoCompra } from '../domain/EstadoCompra.js';
import { toUsuarioPublicoDTO } from './usuarioMapper.js';
import { toReseniaDTO } from './reseniaMapper.js';

/** Qué botones puede mostrar el front según el rol del usuario en la compra. */
const accionesPara = (compra, evento, rol, resenia, ahora) => ({
  pagar: rol === 'comprador' && compra.estado === EstadoCompra.PENDIENTE && !evento.yaOcurrio(ahora),
  cancelar: rol === 'comprador' && compra.puedeCancelarse(evento, ahora),
  utilizar: rol === 'organizador' && compra.estado === EstadoCompra.CONFIRMADA,
  reseniar: rol === 'comprador' && compra.estado === EstadoCompra.UTILIZADA && !resenia,
});

/**
 * @param buscarUsuario si viene, se incluye el historial de estados (vista de detalle)
 */
export const toCompraDTO = (compra, { evento, comprador, resenia, rol, ahora, buscarUsuario }) => {
  const tipo = evento.tiposEntrada.find((t) => t.id === compra.tipoEntradaId);
  const dto = {
    id: compra.id,
    rol,
    estado: compra.estado,
    cantidad: compra.cantidad,
    precioUnitario: compra.precioUnitario,
    total: compra.total,
    fechaCompra: compra.fechaCompra,
    // El caso de uso pide los días faltantes solo para compras confirmadas
    diasParaEvento:
      compra.estado === EstadoCompra.CONFIRMADA ? compra.diasParaEvento(evento, ahora) : null,
    evento: {
      id: evento.id,
      nombre: evento.nombre,
      fecha: evento.fecha,
      lugar: evento.lugar,
      imagen: evento.multimedia[0] ?? null,
      organizadorId: evento.organizadorId,
      finalizado: evento.yaOcurrio(ahora),
    },
    tipoEntrada: { id: tipo.id, nombre: tipo.nombre },
    comprador: toUsuarioPublicoDTO(comprador),
    cantidadMensajes: compra.mensajes.length,
    resenia: resenia ? toReseniaDTO(resenia) : null,
    acciones: accionesPara(compra, evento, rol, resenia, ahora),
  };

  if (buscarUsuario) {
    dto.historial = compra.historial.map((cambio) => ({
      estado: cambio.estado,
      fechaHora: cambio.fechaHora,
      quien: toUsuarioPublicoDTO(buscarUsuario(cambio.quienId)),
    }));
  }
  return dto;
};

export const toMensajeDTO = (mensaje, { autor, evento }) => ({
  id: mensaje.id,
  texto: mensaje.texto,
  enviado: mensaje.enviado,
  autor: toUsuarioPublicoDTO(autor),
  esDelOrganizador: evento.esOrganizadoPor(mensaje.autorId),
});
