import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarEventos } from '../services/eventoService';
import { mensajeError } from '../services/api';

const POR_PAGINA = 10;

/**
 * Búsqueda de eventos paginada en el servidor, para scroll infinito.
 *
 * - Cuando cambian los filtros, vuelve a la página 1.
 * - `cargarMas()` trae la página siguiente (lo llama onEndReached).
 * - Si falla la página siguiente, queda `errorMas` y se reintenta con `reintentarMas()`
 *   (botón "Cargar más"), en vez de reintentar solo en cada scroll.
 * - Solo se aplica la respuesta más reciente (si el usuario sigue tipeando, se descartan las viejas).
 */
export function useEventosPaginados(filtros) {
  const [eventos, setEventos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState(null);
  const [errorMas, setErrorMas] = useState(null);
  const ultimaPeticion = useRef(0);

  // Los filtros llegan como objeto nuevo en cada render: se comparan por contenido
  const clave = JSON.stringify(filtros);

  const cargarPagina = useCallback(
    async (numero, modo) => {
      const id = ++ultimaPeticion.current;
      if (modo === 'inicial') setCargando(true);
      if (modo === 'refresco') setRefrescando(true);
      if (modo === 'mas') setCargandoMas(true);
      modo === 'mas' ? setErrorMas(null) : setError(null);

      try {
        const respuesta = await buscarEventos({ ...JSON.parse(clave), page: numero, limit: POR_PAGINA });
        if (id !== ultimaPeticion.current) return;
        setEventos((anteriores) => (numero === 1 ? respuesta.eventos : [...anteriores, ...respuesta.eventos]));
        setPagina(numero);
        setTotalPaginas(respuesta.totalPaginas);
        setTotal(respuesta.total);
      } catch (err) {
        if (id !== ultimaPeticion.current) return;
        modo === 'mas' ? setErrorMas(mensajeError(err)) : setError(mensajeError(err));
      } finally {
        if (id === ultimaPeticion.current) {
          setCargando(false);
          setRefrescando(false);
          setCargandoMas(false);
        }
      }
    },
    [clave],
  );

  useEffect(() => {
    cargarPagina(1, 'inicial');
  }, [cargarPagina]);

  const hayMas = pagina < totalPaginas;

  const cargarMas = useCallback(() => {
    if (hayMas && !cargando && !cargandoMas && !errorMas) {
      cargarPagina(pagina + 1, 'mas');
    }
  }, [hayMas, cargando, cargandoMas, errorMas, cargarPagina, pagina]);

  return {
    eventos,
    total,
    hayMas,
    cargando,
    refrescando,
    cargandoMas,
    error,
    errorMas,
    cargarMas,
    reintentarMas: () => cargarPagina(pagina + 1, 'mas'),
    refrescar: () => cargarPagina(1, 'refresco'),
    recargar: () => cargarPagina(1, 'inicial'),
  };
}
