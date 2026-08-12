import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

/**
 * Dashboard principal del vigilante.
 * Sirve como acceso rápido a la función más importante: registrar ingreso del estudiante.
 */
export default function VigilanteDashboard() {
  // Obtiene los datos del usuario autenticado para mostrar el saludo.
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-600">Panel de control vigilante</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Acceso Rápido</h2>
        <Link
          to="/vigilante/registrar"
          className="block p-6 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group text-center"
        >
          <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">Registrar Ingreso</h3>
          <p className="text-gray-600">Escanear carnet o ingresar documento del estudiante</p>
        </Link>
      </div>
    </div>
  );
}