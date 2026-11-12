import { useEffect, useState } from 'react';

/** Devuelve `valor` recién cuando deja de cambiar durante `ms` (para no buscar en cada tecla). */
export function useDebounce(valor, ms = 400) {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(timer);
  }, [valor, ms]);

  return demorado;
}
