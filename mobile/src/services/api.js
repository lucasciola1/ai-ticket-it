import axios from 'axios';
import { API_URL } from '../config';

/** Instancia única de Axios: todos los services la reutilizan. */
export const API = axios.create({ baseURL: API_URL, timeout: 10000 });

let tokenActual = null;
let alExpirarSesion = null;

export const setToken = (token) => {
  tokenActual = token;
};

/** El AuthContext registra acá qué hacer cuando el back rechaza el token. */
export const setAlExpirarSesion = (callback) => {
  alExpirarSesion = callback;
};

// Agrega el token a cada request
API.interceptors.request.use((config) => {
  if (tokenActual) {
    config.headers.Authorization = `Bearer ${tokenActual}`;
  }
  return config;
});

// Si el token venció o dejó de ser válido (ej. se reinició el back), cierra la sesión
API.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const codigo = codigoError(error);
    if (tokenActual && ['TOKEN_INVALIDO', 'TOKEN_EXPIRADO'].includes(codigo)) {
      alExpirarSesion?.();
    }
    return Promise.reject(error);
  },
);

/** Mensaje apto para el usuario: el que mandó el back o un fallback de conexión. */
export const mensajeError = (error) =>
  error?.response?.data?.error?.mensaje ?? 'No pudimos conectarnos al servidor';

export const codigoError = (error) => error?.response?.data?.error?.codigo ?? null;

/** Convierte los detalles de validación del back en { campo: mensaje } para los formularios. */
export const erroresPorCampo = (error) => {
  const errores = {};
  for (const { campo, mensaje } of error?.response?.data?.error?.detalles ?? []) {
    if (!(campo in errores)) {
      errores[campo] = mensaje;
    }
  }
  return errores;
};
