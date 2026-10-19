import { useState, useCallback, useMemo } from "react";

/**
 * Hook para manejar filtros y búsqueda
 * @param {Array} data - Datos a filtrar
 * @param {Function} filterFn - Función de filtro personalizada
 * @returns {Object} - {filtered, searchTerm, setSearchTerm, filters, setFilters, clearFilters}
 */
export function useFilters(data = [], filterFn = null) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  const filtered = useMemo(() => {
    let result = [...data];

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(term)
        );
      });
    }

    // Aplicar filtros personalizados
    if (filterFn) {
      result = result.filter((item) => filterFn(item, filters));
    } else if (Object.keys(filters).length > 0) {
      // Filtro genérico basado en coincidencias exactas
      result = result.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return item[key] === value || item[key]?.toString() === value?.toString();
        });
      });
    }

    return result;
  }, [data, searchTerm, filters, filterFn]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({});
  }, []);

  return {
    filtered,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    clearFilters,
  };
}
