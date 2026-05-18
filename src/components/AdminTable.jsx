// AdminTable Component
// Tabla reutilizable para mostrar datos con acciones (editar/eliminar)

import { useState } from "react";

/**
 * Tabla administrativa genérica
 * @param {Object} props
 * @param {Array} props.columns - Definición de columnas [{key, label, render?}]
 * @param {Array} props.data - Datos a mostrar
 * @param {Function} props.onEdit - Callback para editar
 * @param {Function} props.onDelete - Callback para eliminar
 * @param {Boolean} props.loading - Estado de carga
 * @param {Number} props.itemsPerPage - Items por página (default: 10)
 */
export default function AdminTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  loading = false,
  itemsPerPage = 10,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Ordenamiento
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Aplicar ordenamiento
  let sortedData = [...data];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 font-medium">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${
                    column.sortable !== false ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable !== false && sortConfig.key === column.key && (
                      <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="px-3 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-200 text-xs font-medium"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="px-3 py-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-200 text-xs font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} | Total: {data.length} registros
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
