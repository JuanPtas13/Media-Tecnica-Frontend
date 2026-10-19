import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Página que se muestra cuando un usuario intenta acceder a una ruta
 * para la cual no tiene permisos suficientes.
 */
export default function UnauthorizedPage() {
  // Permite navegar hacia otra ruta después de cerrar sesión o volver atrás.
  const navigate = useNavigate();

  // Lee la información de autenticación para cerrar sesión y saber el rol actual.
  const { logout, userRole } = useAuth();

  // Cierra la sesión actual y redirige al login para que vuelva a autenticarse.
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Icono visual que comunica una prohibición o error de permisos. */}
        <div className="mb-4">
          <div className="text-6xl text-red-500">⛔</div>
        </div>

        {/* Título principal de la página. */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Acceso Denegado
        </h1>
        <p className="text-lg text-gray-600 mb-4">403</p>

        {/* muestra el rol actual para explicar por qué no tiene acceso. */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700">
            No tienes permisos para acceder a esta página. Tu rol actual es{" "}
            <span className="font-bold text-red-600">{userRole || "desconocido"}</span>.
          </p>
        </div>

        {/* Mensaje de ayuda para indicar que puede contactar al administrador. */}
        <p className="text-sm text-gray-500 mb-6">
          Si crees que esto es un error, contacta con tu administrador.
        </p>

        {/* Botones para volver o cerrar sesión y salir del sistema. */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Atrás
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
