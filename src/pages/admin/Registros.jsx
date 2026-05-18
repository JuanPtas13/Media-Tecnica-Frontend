import { useState, useEffect } from "react";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FilterPanel from "../../components/FilterPanel";

export default function RegistrosPage() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadRecords, loading: loadingRecords } = useApiCall();
  const { call: loadStudents } = useApiCall();
  const { call: loadUsers } = useApiCall();

  const { filtered, setSearchTerm, filters, setFilters } = useFilters(
    records,
    (item, filterObj) => {
      if (filterObj.estudiante && item.estudiante_id !== parseInt(filterObj.estudiante)) return false;
      if (filterObj.estado && item.estado !== filterObj.estado) return false;
      return true;
    }
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const [recordsData, studentsData, usersData] = await Promise.all([
        loadRecords("/registros", { method: "GET" }),
        loadStudents("/estudiantes", { method: "GET" }),
        loadUsers("/usuarios", { method: "GET" }),
      ]);  
      setRecords(recordsData?.data || recordsData?.data?.registros || []);
      setStudents(studentsData?.data?.estudiantes || studentsData?.data || []);
      setUsers(usersData?.data || []);

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  const getStudentName = (id) => {
    const student = students.find((s) => s.id_estudiante === id);
    return student ? `${student.nombre} ${student.apellido1}` : "Desconocido";
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id_usuario === id);
    return user ? user.nombre : "Desconocido";
  };

  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (value) => new Date(value).toLocaleDateString("es-ES"),
    },
    { key: "hora", label: "Hora" },
    {
      key: "estudiante_id",
      label: "Estudiante",
      render: (value) => getStudentName(value),
    },
    {
      key: "usuario_id",
      label: "Registrado por",
      render: (value) => getUserName(value),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => {
        const config = {
          "a tiempo": { bg: "bg-green-100", text: "text-green-700", label: "A tiempo" },
          "tarde":    { bg: "bg-yellow-100", text: "text-yellow-700", label: "Tarde" },
        };
        const style = config[value] ?? { bg: "bg-gray-100", text: "text-gray-600", label: value };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        );
      },
    },
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
            key: "estudiante",
            label: "Estudiante",
            type: "select",
            options: students.map((s) => ({
              label: `${s.nombre} ${s.apellido1}`,  // ✅ apellido1
              value: s.id_estudiante,               // ✅ id_estudiante
            })),
          },
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "Presente", value: "presente" },
              { label: "Ausente", value: "ausente" },
              { label: "Tardío", value: "tardio" },
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