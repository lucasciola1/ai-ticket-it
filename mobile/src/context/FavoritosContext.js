import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as eventoService from '../services/eventoService';
import { useAuth } from './AuthContext';

const FavoritosContext = createContext(undefined);

/**
 * Los favoritos se ven en Explorar, DetalleEvento y Perfil:
 * estado compartido entre pantallas lejanas → Context.
 */
export function FavoritosProvider({ children }) {
  const { usuario } = useAuth();
  const [ids, setIds] = useState(new Set());

  // Al cambiar de usuario (login/logout) se toman sus favoritos
  useEffect(() => {
    setIds(new Set(usuario?.favoritos ?? []));
  }, [usuario]);

  const esFavorito = useCallback((eventoId) => ids.has(eventoId), [ids]);

  /** Actualización optimista: cambia ya y, si el back falla, vuelve atrás. */
  const alternarFavorito = useCallback(
    async (eventoId) => {
      const eraFavorito = ids.has(eventoId);
      const conCambio = (set, agregar) => {
        const nuevo = new Set(set);
        agregar ? nuevo.add(eventoId) : nuevo.delete(eventoId);
        return nuevo;
      };
      setIds((actual) => conCambio(actual, !eraFavorito));
      try {
        const favoritos = eraFavorito
          ? await eventoService.desmarcarFavorito(eventoId)
          : await eventoService.marcarFavorito(eventoId);
        setIds(new Set(favoritos));
      } catch (error) {
        setIds((actual) => conCambio(actual, eraFavorito));
        throw error;
      }
    },
    [ids],
  );

  const valor = useMemo(
    () => ({ favoritos: ids, esFavorito, alternarFavorito }),
    [ids, esFavorito, alternarFavorito],
  );

  return <FavoritosContext.Provider value={valor}>{children}</FavoritosContext.Provider>;
}

export const useFavoritos = () => {
  const contexto = useContext(FavoritosContext);
  if (!contexto) {
    throw new Error('useFavoritos debe usarse dentro de un FavoritosProvider');
  }
  return contexto;
};
