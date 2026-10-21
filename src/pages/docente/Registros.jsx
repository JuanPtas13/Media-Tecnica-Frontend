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
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loadError, setLoadError] = useState("");
  const [studentsError, setStudentsError] = useState("");

  // Controla la carga inicial de la vista.
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook que ejecuta la petición para obtener registros.
  const { call: loadRecords, loading: loadingRecords } = useApiCall();
  const { call: loadStudents, loading: loadingStudents } = useApiCall();

  const recordsWithStudentNames = records.map((record) => {
    const student = students.find((item) => item.id_estudiante === record.estudiante_id);
    return {
      ...record,
      estudiante_nombre: student ? `${student.nombre} ${student.apellido1} ${student.apellido2 || ""}`.trim() : "",
    };
  });

  const { filtered, setSearchTerm, filters, setFilters } = useFilters(
    recordsWithStudentNames,
    (item, filterObj) => {
      if (filterObj.fecha && item.fecha !== filterObj.fecha) return false;
      if (filterObj.estado && item.estado !== filterObj.estado) return false;
      return true;
    }
  );

  useEffect(() => {
    let cancelled = false;
    // Carga estudiantes activos para convertir sus identificadores a nombres.
    async function loadInitialData() {
      try {
        const data = await loadStudents("/estudiantes/activos?limit=1000", { method: "GET" });
        if (!cancelled) {
          setStudents(Array.isArray(data?.data) ? data.data : []);
          setStudentsError("");
        }
      } catch (error) {
        console.error("Error cargando estudiantes para registros:", error);
        if (!cancelled) {
          setStudentsError("No se pudieron cargar los nombres de los estudiantes.");
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [loadStudents]);

  useEffect(() => {
    let cancelled = false;
    // Consulta el historial completo o filtrado por fecha, según la selección.
    async function loadRecordsForDate() {
      const endpoint = selectedDate
        ? `/registros/fecha/${selectedDate}?limit=1000`
        : "/registros?limit=1000";
      try {
        const data = await loadRecords(endpoint, { method: "GET" });
        if (!cancelled) {
          setRecords(Array.isArray(data?.data) ? data.data : []);
          setLoadError("");
        }
      } catch (error) {
        console.error("Error cargando registros:", error);
        if (!cancelled) {
          setRecords([]);
          setLoadError("No se pudieron cargar los registros. Intenta nuevamente.");
        }
      }
    }

    loadRecordsForDate();
    return () => {
      cancelled = true;
    };
  }, [loadRecords, selectedDate]);

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
    { key: "estudiante_nombre", label: "Estudiante" },
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

      {(loadError || studentsError) && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError || studentsError}
        </div>
      )}

      <FilterPanel
        searchPlaceholder="Buscar por nombre de estudiante o estado..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => {
          if (key === "fecha") setSelectedDate(value);
          setFilters({ ...filters, [key]: value });
        }}
        filters={[
          {
            key: "fecha",
            label: "Fecha",
            type: "date",
          },
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "A tiempo", value: "a tiempo" },
              { label: "Tarde", value: "tarde" },
            ],
          },
        ]}
        loading={loadingRecords || loadingStudents}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingRecords || loadingStudents || initialLoading}
        itemsPerPage={20}
      />
    </div>
  );
}