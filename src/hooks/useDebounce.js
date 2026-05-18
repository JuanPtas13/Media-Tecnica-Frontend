import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook para Debounce
 * Retrasa la ejecución de una función hasta que dejan de cambiar los valores
 * 
 * Caso de uso: Búsqueda en tiempo real
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para Debounce con callback
 * Ejecuta una función después del debounce
 */
export function useDebouncedCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook para búsqueda con debounce
 */
export function useDebouncedSearch(initialValue = "", delay = 500) {
  const [value, setValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedValue = useDebounce(value, delay);

  const handleChange = useCallback((e) => {
    const newValue = e.target?.value || e;
    setValue(newValue);
    setIsSearching(true);
  }, []);

  const reset = useCallback(() => {
    setValue("");
    setIsSearching(false);
  }, []);

  useEffect(() => {
    setIsSearching(false);
  }, [debouncedValue]);

  return {
    value,
    setValue,
    debouncedValue,
    handleChange,
    reset,
    isSearching,
  };
}

/**
 * Hook para Throttle
 * Ejecuta una función máximo cada N milisegundos
 * Caso de uso: Scroll, resize, eventos frecuentes
 */
export function useThrottle(value, delay = 1000) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastRef.current + delay) {
      lastRef.current = now;
      setThrottledValue(value);
    } else {
      const handler = setTimeout(() => {
        lastRef.current = Date.now();
        setThrottledValue(value);
      }, delay - (now - lastRef.current));

      return () => clearTimeout(handler);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * Hook para Throttle con callback
 */
export function useThrottledCallback(callback, delay = 1000) {
  const throttleRef = useRef(null);
  const lastRef = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();

      if (now >= lastRef.current + delay) {
        lastRef.current = now;
        callback(...args);
      } else {
        if (throttleRef.current) {
          clearTimeout(throttleRef.current);
        }

        throttleRef.current = setTimeout(() => {
          lastRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastRef.current));
      }
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
