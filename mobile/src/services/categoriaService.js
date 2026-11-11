import { API } from './api';

export const obtenerCategorias = async () => (await API.get('/categorias')).data;
