import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiCall } from "../../hooks/useApiCall";
import StatCard from "../../components/StatCard";

function getLocalDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function DocenteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, aTiempo: 0, tarde: 0, ausente: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { call: loadRegistros } = useApiCall();
  const { call: loadGrados } = useApiCall();
  const { call: loadReporteGrado } = useApiCall();

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const fecha = getLocalDate();
        const [registrosResponse, gradosResponse] = await Promise.all([
          loadRegistros(`/registros/fecha/${fecha}?limit=1000`, { method: "GET" }),
          loadGrados("/grados/activos?limit=1000", { method: "GET" }),
        ]);
        const registros = registrosResponse?.data;
        const grados = gradosResponse?.data;
        if (!Array.isArray(registros) || !Array.isArray(grados)) {
          throw new Error("La respuesta de asistencia no tiene el formato esperado.");
        }

        const reportes = await Promise.all(
          grados.map((grado) =>
            loadReporteGrado(
              `/reportes/asistencia/grado/${grado.id_grado}?fecha=${fecha}`,
              { method: "GET" }
            )
          )
        );
        const ausentes = reportes.reduce(
          (total, response) => total + (response?.data?.ausentes || 0),
          0
        );
        setStats({
          total: registros.length,
          aTiempo: registros.filter((registro) => registro.estado === "a tiempo").length,
          tarde: registros.filter((registro) => registro.estado === "tarde").length,
          ausente: ausentes,
        });
        setLoadError("");
      } catch (error) {
        console.error("Error cargando estadísticas docentes:", error);
        setLoadError("No se pudieron cargar las estadísticas de asistencia de hoy.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [loadGrados, loadRegistros, loadReporteGrado]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-600">Panel de control docente</p>
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="📋" title="Registros de hoy" value={loading || loadError ? "-" : stats.total} color="blue" />
        <StatCard icon="✅" title="A Tiempo hoy" value={loading || loadError ? "-" : stats.aTiempo} color="green" />
        <StatCard icon="⏰" title="Tarde hoy" value={loading || loadError ? "-" : stats.tarde} color="yellow" />
        <StatCard icon="❌" title="Ausentes confirmados hoy" value={loading || loadError ? "-" : stats.ausente} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/docente/registros"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="font-semibold text-gray-900 mb-1">Registros</h3>
            <p className="text-sm text-gray-600">Ver historial de asistencia</p>
          </Link>
          <Link to="/docente/reportes"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="font-semibold text-gray-900 mb-1">Reportes</h3>
            <p className="text-sm text-gray-600">Generar reportes de asistencia</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
