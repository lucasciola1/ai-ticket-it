import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Ejecuta `recargar` cada vez que la pantalla vuelve a estar en foco
 * (ej. al volver del detalle de una compra que se pagó o canceló).
 * La primera vez no hace nada: la carga inicial ya la hace useCarga.
 */
export function useRecargarAlVolver(recargar) {
  const primeraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }
      recargar();
    }, [recargar]),
  );
}
