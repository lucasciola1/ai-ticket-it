import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { setAlExpirarSesion, setToken } from '../services/api';

const CLAVE_TOKEN = 'aiticketit.token';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [restaurando, setRestaurando] = useState(true);

  const guardarSesion = useCallback(async ({ token, usuario: nuevoUsuario }) => {
    setToken(token);
    await AsyncStorage.setItem(CLAVE_TOKEN, token);
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUsuario(null);
    await AsyncStorage.removeItem(CLAVE_TOKEN);
  }, []);

  const login = useCallback(
    async (email, password) => guardarSesion(await authService.login(email, password)),
    [guardarSesion],
  );

  const registrar = useCallback(
    async (datos) => guardarSesion(await authService.registrar(datos)),
    [guardarSesion],
  );

  // Si el back rechaza el token en cualquier request, se cierra la sesión
  useEffect(() => {
    setAlExpirarSesion(logout);
  }, [logout]);

  // Al abrir la app, recupera la sesión guardada
  useEffect(() => {
    const restaurar = async () => {
      try {
        const token = await AsyncStorage.getItem(CLAVE_TOKEN);
        if (token) {
          setToken(token);
          setUsuario(await authService.obtenerUsuarioActual());
        }
      } catch {
        // Token vencido o back reiniciado (los datos son en memoria): se entra sin sesión
        await logout();
      } finally {
        setRestaurando(false);
      }
    };
    restaurar();
  }, [logout]);

  const valor = useMemo(
    () => ({ usuario, restaurando, login, registrar, logout }),
    [usuario, restaurando, login, registrar, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return contexto;
};
