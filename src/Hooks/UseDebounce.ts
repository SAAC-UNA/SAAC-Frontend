/**
 * useDebounce - Hook para debouncing de valores
 * 
 * Útil para optimizar búsquedas y otros inputs que pueden
 * generar muchas actualizaciones innecesarias.
 */

import { useState, useEffect } from 'react';

/**
 * Hook que retorna un valor "debounced" (retrasado)
 * 
 * @param value - El valor a hacer debounce
 * @param delay - El tiempo de retraso en milisegundos (por defecto 300ms)
 * @returns El valor después del retraso
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Esta búsqueda solo se ejecutará después de 500ms de que el usuario deje de escribir
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un timeout para actualizar el valor debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que se ejecute
    // Esto previene actualizaciones innecesarias
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
