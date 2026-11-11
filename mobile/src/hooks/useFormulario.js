import { useState } from 'react';
import { erroresPorCampo, mensajeError } from '../services/api';

/**
 * Estado de un formulario controlado que se envía al back:
 * valores, errores por campo (los `detalles` de Zod del back), error general y "enviando".
 */
export function useFormulario(valoresIniciales) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const setValorDe = (campo) => (valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    // al corregir un campo, se borra su error
    setErrores(({ [campo]: _borrado, ...resto }) => resto);
  };

  /** Ejecuta el envío mostrando "enviando" y repartiendo los errores del back. */
  const enviar = async (accion) => {
    setEnviando(true);
    setError(null);
    setErrores({});
    try {
      return await accion(valores);
    } catch (err) {
      setErrores(erroresPorCampo(err));
      setError(mensajeError(err));
      return undefined;
    } finally {
      setEnviando(false);
    }
  };

  return { valores, setValores, setValorDe, errores, error, enviando, enviar };
}
