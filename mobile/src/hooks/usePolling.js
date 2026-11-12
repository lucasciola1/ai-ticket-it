import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Ejecuta `callback` cada `ms` milisegundos solo mientras la pantalla está en foco.
 * Al salir de la pantalla se limpia el intervalo (no queda consultando en segundo plano).
 */
export function usePolling(callback, ms) {
  const ultimoCallback = useRef(callback);
  useEffect(() => {
    ultimoCallback.current = callback;
  }, [callback]);

  useFocusEffect(
    useCallback(() => {
      const intervalo = setInterval(() => ultimoCallback.current(), ms);
      return () => clearInterval(intervalo);
    }, [ms]),
  );
}
