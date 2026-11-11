import { API } from './api';
import { aEvento, aEventoNuevoBody, aResenia } from './adapters';

/** Búsqueda paginada en el servidor (texto, categoría, precio, orden). */
export const buscarEventos = async ({ q, categoriaId, precioMin, precioMax, orden, dir, page = 1, limit = 10 }) => {
  const params = { q: q || undefined, categoriaId, precioMin, precioMax, orden, dir, page, limit };
  const r = await API.get('/eventos', { params });
  return {
    eventos: r.data.items.map(aEvento),
    total: r.data.total,
    pagina: r.data.page,
    totalPaginas: r.data.totalPages,
  };
};

export const obtenerEvento = async (id) => aEvento((await API.get(`/eventos/${id}`)).data);

export const crearEvento = async (form) => aEvento((await API.post('/eventos', aEventoNuevoBody(form))).data);

export const obtenerMisEventos = async () => (await API.get('/usuarios/me/eventos')).data.map(aEvento);

export const obtenerFavoritos = async () => (await API.get('/usuarios/me/favoritos')).data.map(aEvento);

export const marcarFavorito = async (eventoId) =>
  (await API.put(`/usuarios/me/favoritos/${eventoId}`)).data.favoritos;

export const desmarcarFavorito = async (eventoId) =>
  (await API.delete(`/usuarios/me/favoritos/${eventoId}`)).data.favoritos;

export const obtenerReseniasDeOrganizador = async (organizadorId) => {
  const { data } = await API.get(`/organizadores/${organizadorId}/resenias`);
  return { ...data, resenias: data.resenias.map(aResenia) };
};
