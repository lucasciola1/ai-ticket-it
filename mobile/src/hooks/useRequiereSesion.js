import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Guarda de sesión para acciones (comprar, favorito, chatear…).
 *
 *   const conSesion = useRequiereSesion();
 *   <Boton onPress={conSesion(() => navigation.navigate('Comprar'))} />
 *
 * Con sesión ejecuta la acción; sin sesión abre Login (y al loguearse vuelve acá).
 */
export function useRequiereSesion() {
  const { usuario } = useAuth();
  const navigation = useNavigation();

  return useCallback(
    (accion) =>
      (...args) => {
        if (usuario) {
          return accion(...args);
        }
        navigation.navigate('Login');
      },
    [usuario, navigation],
  );
}
