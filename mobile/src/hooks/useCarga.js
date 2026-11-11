import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeError } from '../services/api';

/**
 * Patrón cargando / error / datos para cualquier llamada a un service.
 *
 *   const { datos, cargando, error, recargar } = useCarga(() => obtenerEvento(id), [id]);
 *
 * - `recargar()` vuelve a mostrar el spinner (botón "Reintentar").
 * - `refrescar()` recarga sin spinner de pantalla completa (arrastrar para recargar).
 * - Si las dependencias cambian rápido, solo se aplica la respuesta más reciente.
 */
export function useCarga(cargar, deps = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);
  const ultimaPeticion = useRef(0);

  const ejecutar = useCallback(async ({ silencioso = false } = {}) => {
    const id = ++ultimaPeticion.current;
    silencioso ? setRefrescando(true) : setCargando(true);
    setError(null);
    try {
      const resultado = await cargar();
      if (id === ultimaPeticion.current) setDatos(resultado);
    } catch (err) {
      if (id === ultimaPeticion.current) setError(mensajeError(err));
    } finally {
      if (id === ultimaPeticion.current) {
        setCargando(false);
        setRefrescando(false);
      }
    }
    // Las dependencias las define quien usa el hook (ej. [id]), como en useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    ejecutar();
  }, [ejecutar]);

  const recargar = useCallback(() => ejecutar(), [ejecutar]);
  const refrescar = useCallback(() => ejecutar({ silencioso: true }), [ejecutar]);

  return { datos, setDatos, cargando, refrescando, error, recargar, refrescar };
}
