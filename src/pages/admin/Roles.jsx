import { useEffect, useState } from "react";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FilterPanel from "../../components/FilterPanel";

const formatPermissions = (permissions) => {
  if (permissions === "all") return "Todos los permisos";
  if (!permissions) return "Sin permisos asignados";
  return permissions
    .split(",")
    .map((permission) => permission.trim().replace(/_/g, " "))
    .filter(Boolean)
    .join(", ");
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { call: loadRoles, loading: loadingRoles } = useApiCall();
  const { filtered, setSearchTerm } = useFilters(roles);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setInitialLoading(true);
        const rolesData = await loadRoles("/roles", { method: "GET" });
        const roleList = rolesData?.data;
        if (!Array.isArray(roleList)) {
          throw new Error("La respuesta de roles no tiene el formato esperado.");
        }
        setRoles(roleList);
        setLoadError("");
      } catch (error) {
        console.error("Error cargando roles:", error);
        setLoadError("No se pudieron cargar los roles disponibles. Intenta nuevamente.");
      } finally {
        setInitialLoading(false);
      }
    }

    loadInitialData();
  }, [loadRoles]);

  const columns = [
    { key: "nombre", label: "Rol" },
    {
      key: "descripcion",
      label: "Función",
      render: (description) => description || "Sin descripción registrada",
    },
    {
      key: "permisos",
      label: "Permisos disponibles",
      render: formatPermissions,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Roles disponibles</h1>
        <p className="mt-1 text-gray-600">
          Consulta las funciones y permisos asignados a cada rol del sistema.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      <FilterPanel
        searchPlaceholder="Buscar rol, función o permiso..."
        onSearch={setSearchTerm}
        loading={loadingRoles}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingRoles || initialLoading}
        itemsPerPage={10}
      />
    </div>
  );
}
