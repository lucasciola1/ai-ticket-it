import { API } from './api';
import { aCompra, aEvento, aMensaje, aResenia } from './adapters';

export const comprar = async ({ eventoId, tipoEntradaId, cantidad }) =>
  aCompra((await API.post('/compras', { eventoId, tipoEntradaId, cantidad })).data);

export const obtenerMisCompras = async () => (await API.get('/usuarios/me/compras')).data.map(aCompra);

export const obtenerCompra = async (id) => aCompra((await API.get(`/compras/${id}`)).data);

export const pagarCompra = async (id) => aCompra((await API.post(`/compras/${id}/pagar`)).data);

export const cancelarCompra = async (id) => aCompra((await API.post(`/compras/${id}/cancelar`)).data);

export const marcarUtilizada = async (id) => aCompra((await API.post(`/compras/${id}/utilizar`)).data);

/** Vista del organizador: compras de un evento, resumen por estado y disponibles por tipo. */
export const obtenerComprasDelEvento = async (eventoId, estado) => {
  const { data } = await API.get(`/eventos/${eventoId}/compras`, { params: { estado } });
  return {
    ...data,
    evento: aEvento(data.evento),
    compras: data.compras.map(aCompra),
  };
};

export const obtenerMensajes = async (compraId) =>
  (await API.get(`/compras/${compraId}/mensajes`)).data.map(aMensaje);

export const enviarMensaje = async (compraId, texto) =>
  aMensaje((await API.post(`/compras/${compraId}/mensajes`, { texto })).data);

export const reseniarCompra = async (compraId, { puntuacion, detalle }) =>
  aResenia((await API.post(`/compras/${compraId}/resenia`, { puntuacion, detalle })).data);
