import { useRef, useCallback, useState } from "react";

/**
 * Hook para cachear datos de API
 * Evita requests repetidas en corto tiempo
 */
export function useCache(duration = 5 * 60 * 1000) {
  // 5 minutos por defecto
  const cacheRef = useRef({});
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Devuelve un valor vigente y actualiza contadores; elimina entradas expiradas.
  const getFromCache = useCallback((key) => {
    const cached = cacheRef.current[key];

    if (cached) {
      if (Date.now() - cached.timestamp < duration) {
        setCacheStats((prev) => ({ ...prev, hits: prev.hits + 1 }));
        return cached.data;
      } else {
        // Expirado, eliminar
        delete cacheRef.current[key];
      }
    }

    setCacheStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [duration]);

  // Guarda el resultado junto al instante de creación para poder comprobar su vigencia.
  const setInCache = useCallback((key, data) => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
    };
  }, []);

  // Borra una clave específica o vacía todo el caché cuando no se indica una clave.
  const clearCache = useCallback((key = null) => {
    if (key) {
      delete cacheRef.current[key];
    } else {
      cacheRef.current = {};
    }
  }, []);

  // Cuenta las entradas guardadas sin exponer el objeto interno del caché.
  const getCacheSize = useCallback(() => {
    return Object.keys(cacheRef.current).length;
  }, []);

  return {
    getFromCache,
    setInCache,
    clearCache,
    getCacheSize,
    cacheStats,
  };
}

/**
 * Hook con caché integrado para API calls
 */
export function useCachedApiCall(duration = 5 * 60 * 1000) {
  const { getFromCache, setInCache, clearCache } = useCache(duration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Reutiliza caché cuando existe; de lo contrario consulta, guarda y propaga errores.
  const call = useCallback(
    async (cacheKey, apiFunction, ...args) => {
      // Intentar obtener del caché
      const cached = getFromCache(cacheKey);
      if (cached) {
        setData(cached);
        return cached;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setInCache(cacheKey, result);
        setData(result);
        return result;
      } catch (err) {
        const errorMsg = err.message || "Error en API call";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, setInCache]
  );

  return {
    data,
    loading,
    error,
    call,
    clearCache,
  };
}
