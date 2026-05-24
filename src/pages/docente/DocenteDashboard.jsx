import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApiCall } from "../../hooks/useApiCall";
import StatCard from "../../components/StatCard";

export default function DocenteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, aTiempo: 0, tarde: 0, ausente: 0 });
  const [loading, setLoading] = useState(true);

  const { call: loadRegistros } = useApiCall();
  const { call: loadReporteGrado } = useApiCall();
  const { call: loadReporteEstudiante } = useApiCall();
  const { call: loadReporteActividad } = useApiCall();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await loadRegistros("/registros", { method: "GET" });
      const registros = data?.data || [];
      setStats({
        total: registros.length,
        aTiempo: registros.filter((r) => r.estado === "a tiempo").length,
        tarde: registros.filter((r) => r.estado === "tarde").length,
        ausente: registros.filter((r) => r.estado === "ausente").length,
      });

      const [gradoData, estudianteData, actividadData] = await Promise.all([
        loadReporteGrado("/reportes/asistencia/grado/1?fecha=2026-05-18", { method: "GET" }),
        loadReporteEstudiante("/reportes/asistencia/estudiante/2?fecha_inicio=2026-01-01&fecha_fin=2026-05-21", { method: "GET" }),
        loadReporteActividad("/reportes/actividad?fecha_inicio=2026-01-01&fecha_fin=2026-05-21", { method: "GET" }),
      ]);


    } catch (error) {
      console.error("Error cargando stats:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-600">Panel de control docente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="📋" title="Total Registros" value={loading ? "-" : stats.total} color="blue" />
        <StatCard icon="✅" title="A Tiempo" value={loading ? "-" : stats.aTiempo} color="green" />
        <StatCard icon="⏰" title="Tarde" value={loading ? "-" : stats.tarde} color="yellow" />
        <StatCard icon="❌" title="Ausentes" value={loading ? "-" : stats.ausente} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/docente/registros"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="font-semibold text-gray-900 mb-1">Registros</h3>
            <p className="text-sm text-gray-600">Ver historial de asistencia</p>
          </a>
          <a href="/docente/reportes"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="font-semibold text-gray-900 mb-1">Reportes</h3>
            <p className="text-sm text-gray-600">Generar reportes de asistencia</p>
          </a>
        </div>
      </div>
    </div>
  );
}