import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar de navegación para el panel admin
 * Incluye todos los módulos disponibles según el rol del usuario
 */
export default function AdminSidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(`/admin${path}`);
  };

  const menuItems = [
    {
      icon: "📊",
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "👥",
      label: "Estudiantes",
      path: "/estudiantes",
    },
    {
      icon: "👤",
      label: "Usuarios",
      path: "/usuarios",
    },
    {
      icon: "📋",
      label: "Registros",
      path: "/registros",
    },
    {
      icon: "🎓",
      label: "Grados",
      path: "/grados",
    },
    {
      icon: "🔐",
      label: "Roles",
      path: "/roles",
    },
    {
      icon: "⏰",
      label: "Config. Horaria",
      path: "/configuracion",
    },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg md:shadow-none transition-transform duration-300 z-50 md:z-auto flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SA</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Sistema Escolar</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={`/admin${item.path}`}
              onClick={() => {
                // Cerrar sidebar en mobile al hacer click
                if (window.innerWidth < 768) {
                  onToggle();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {user && (
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Conectado como:</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.nombre}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
