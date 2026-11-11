import { API } from './api';
import { aUsuario } from './adapters';

const aSesion = ({ token, usuario }) => ({ token, usuario: aUsuario(usuario) });

export const login = async (email, password) => {
  const r = await API.post('/auth/login', { email, password });
  return aSesion(r.data);
};

export const registrar = async ({ nombre, apellido, email, password }) => {
  const r = await API.post('/auth/register', { nombre, apellido, email, password });
  return aSesion(r.data);
};

export const obtenerUsuarioActual = async () => {
  const r = await API.get('/usuarios/me');
  return aUsuario(r.data);
};
