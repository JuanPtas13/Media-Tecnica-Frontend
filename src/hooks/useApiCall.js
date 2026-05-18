import { useState, useCallback } from "react";
import { apiCall } from "../services/api";

/**
 * Hook para manejar llamadas a API con loading, error y data states
 * @param {String} initialEndpoint - Endpoint inicial (opcional)
 * @returns {Object} - {data, loading, error, call, reset}
 */
export function useApiCall(initialEndpoint = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall(endpoint, options);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.message || "Error en la solicitud";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, call, reset };
}
