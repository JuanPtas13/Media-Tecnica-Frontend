/**
 * Componente para panel de filtros
 */
export default function FilterPanel({
  onSearch,
  onFilterChange,
  filters = [],
  searchPlaceholder = "Buscar...",
  loading = false,
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              {filter.type === "select" ? (
                <select
                  onChange={(e) =>
                    onFilterChange?.(filter.key, e.target.value)
                  }
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">Todos</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || "text"}
                  onChange={(e) =>
                    onFilterChange?.(filter.key, e.target.value)
                  }
                  disabled={loading}
                  placeholder={filter.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
