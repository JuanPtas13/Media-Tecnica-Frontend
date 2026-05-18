import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import { estudiantesService } from "../services/estudiantesService";
import { usuariosService } from "../services/usuariosService";
import { registrosService } from "../services/registrosService";
import { gradosService } from "../services/gradosService";

/**
 * Dashboard principal del panel de administración
 * Muestra estadísticas generales del sistema
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    estudiantes: 0,
    usuarios: 0,
    registros: 0,
    grados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          estudiantesData,
          usuariosData,
          registrosData,
          gradosData,
        ] = await Promise.all([
          estudiantesService.getAll(),
          usuariosService.getAll(),
          registrosService.getAll(),
          gradosService.getAll(),
        ]);

        setStats({
          estudiantes: estudiantesData?.length || 0,
          usuarios: usuariosData?.length || 0,
          registros: registrosData?.length || 0,
          grados: gradosData?.length || 0,
        });
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-600">
          Panel de control del sistema de gestión escolar
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="👥"
          title="Total de Estudiantes"
          value={loading ? "-" : stats.estudiantes}
          color="blue"
        />
        <StatCard
          icon="👤"
          title="Total de Usuarios"
          value={loading ? "-" : stats.usuarios}
          color="green"
        />
        <StatCard
          icon="📋"
          title="Total de Registros"
          value={loading ? "-" : stats.registros}
          color="purple"
        />
        <StatCard
          icon="🎓"
          title="Total de Grados"
          value={loading ? "-" : stats.grados}
          color="yellow"
        />
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/estudiantes"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Estudiantes</h3>
            <p className="text-sm text-gray-600">
              Gestionar estudiantes del sistema
            </p>
          </a>

          <a
            href="/admin/usuarios"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Usuarios</h3>
            <p className="text-sm text-gray-600">
              Administrar usuarios y roles
            </p>
          </a>

          <a
            href="/admin/registros"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Registros</h3>
            <p className="text-sm text-gray-600">
              Ver historial de asistencia
            </p>
          </a>

          <a
            href="/admin/grados"
            className="p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Grados</h3>
            <p className="text-sm text-gray-600">
              Gestionar grados y grupos
            </p>
          </a>

          <a
            href="/admin/roles"
            className="p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              🔐
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Roles</h3>
            <p className="text-sm text-gray-600">
              Configurar roles y permisos
            </p>
          </a>

          <a
            href="/admin/configuracion"
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              ⏰
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Config. Horaria</h3>
            <p className="text-sm text-gray-600">
              Configurar horarios y tolerancia
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
