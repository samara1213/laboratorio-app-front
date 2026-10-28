import { useEffect, useState } from 'react';

/**
 * Valor que se actualiza cuando deja de cambiar por `delay` ms (búsquedas en el servidor mientras se escribe)
 * @param {T} value valor actual
 * @param {number} delay espera en milisegundos
 * @returns {T} último valor estable
 * @template T
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
