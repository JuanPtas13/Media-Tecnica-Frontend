import { useState, useEffect } from "react";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FilterPanel from "../../components/FilterPanel";

/**
 * Vista de registros del docente.
 * Muestra el historial de asistencia del grupo y permite filtrarlo por estado.
 */
export default function DocenteRegistros() {
  // Guarda la lista de registros de asistencia.
  const [records, setRecords] = useState([]);

  // Controla la carga inicial de la vista.
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook que ejecuta la petición para obtener registros.
  const { call: loadRecords, loading: loadingRecords } = useApiCall();

  // Filtra los registros por estado para que el docente pueda hacer búsquedas rápidas.
  const { filtered, setSearchTerm, filters, setFilters } = useFilters(
    records,
    (item, filterObj) => {
      if (filterObj.estado && item.estado !== filterObj.estado) return false;
      return true;
    }
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  // Obtiene el historial de asistencia desde el backend.
  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const data = await loadRecords("/registros", { method: "GET" });
      setRecords(data?.data || []);
    } catch (error) {
      console.error("Error cargando registros:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  // Define cómo se muestran las columnas y valores del historial.
  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (value) => new Date(value + "T00:00:00").toLocaleDateString("es-ES"),
    },
    {
      key: "hora",
      label: "Hora",
      render: (value) => value?.slice(0, 5),
    },
    { key: "estudiante_id", label: "Estudiante ID" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => {
        const config = {
          "a tiempo": { bg: "bg-green-100", text: "text-green-700", label: "A tiempo" },
          "tarde": { bg: "bg-yellow-100", text: "text-yellow-700", label: "Tarde" },
          "ausente": { bg: "bg-red-100", text: "text-red-700", label: "Ausente" },
        };
        const style = config[value] ?? { bg: "bg-gray-100", text: "text-gray-600", label: value };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        );
      },
    },
    { key: "min_retraso", label: "Min. Retraso" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Registros</h1>
        <p className="text-gray-600 mt-1">Historial de asistencia</p>
      </div>

      <FilterPanel
        searchPlaceholder="Buscar en registros..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        filters={[
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "A tiempo", value: "a tiempo" },
              { label: "Tarde", value: "tarde" },
              { label: "Ausente", value: "ausente" },
            ],
          },
        ]}
        loading={loadingRecords}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingRecords || initialLoading}
        itemsPerPage={20}
      />
    </div>
  );
}