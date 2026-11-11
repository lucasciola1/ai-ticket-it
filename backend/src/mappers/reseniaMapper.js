import { toUsuarioPublicoDTO } from './usuarioMapper.js';

export const toReseniaDTO = (resenia, { evento, comprador } = {}) => ({
  id: resenia.id,
  compraId: resenia.compraId,
  puntuacion: resenia.puntuacion,
  detalle: resenia.detalle,
  fecha: resenia.fecha,
  ...(evento && { evento: { id: evento.id, nombre: evento.nombre, fecha: evento.fecha } }),
  ...(comprador && { comprador: toUsuarioPublicoDTO(comprador) }),
});
