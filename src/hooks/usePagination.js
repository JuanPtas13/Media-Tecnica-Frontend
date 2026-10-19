import { useState, useCallback, useMemo } from "react";

/**
 * Hook para Paginación
 * Maneja lógica de paginación de forma completa
 */
export function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular número de páginas
  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  );

  // Validar que la página actual es válida
  const validPage = Math.min(Math.max(currentPage, 1), totalPages || 1);

  // Obtener items de la página actual
  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, validPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(pageNum);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(validPage + 1);
  }, [validPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(validPage - 1);
  }, [validPage, goToPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages || 1);
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: validPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    hasNextPage: validPage < totalPages,
    hasPrevPage: validPage > 1,
  };
}

/**
 * Hook para Sorting (Ordenamiento)
 */
export function useSorting(items, defaultKey = null, defaultOrder = "asc") {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortOrder, setSortOrder] = useState(defaultOrder);

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Manejo de valores null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Comparación por tipo
      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date) {
        return sortOrder === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return sorted;
  }, [items, sortKey, sortOrder]);

  const toggleSort = useCallback((key) => {
    if (sortKey === key) {
      // Toggle order si es la misma columna
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Nueva columna, ordenar ascendente
      setSortKey(key);
      setSortOrder("asc");
    }
  }, [sortKey, sortOrder]);

  const resetSort = useCallback(() => {
    setSortKey(defaultKey);
    setSortOrder(defaultOrder);
  }, [defaultKey, defaultOrder]);

  return {
    sortedItems,
    sortKey,
    sortOrder,
    toggleSort,
    resetSort,
  };
}

/**
 * Hook combinado de Paginación + Sorting
 */
export function usePaginationAndSort(
  items,
  itemsPerPage = 10,
  defaultSortKey = null,
  defaultSortOrder = "asc"
) {
  const { sortedItems, ...sorting } = useSorting(items, defaultSortKey, defaultSortOrder);
  const { ...pagination } = usePagination(sortedItems, itemsPerPage);

  return {
    ...pagination,
    ...sorting,
    // Items ya están paginados y ordenados
    displayedItems: pagination.paginatedItems,
  };
}
