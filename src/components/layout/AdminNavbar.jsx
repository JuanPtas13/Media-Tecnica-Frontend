import { useAuth } from "../../context/AuthContext";

/**
 * Navbar superior del panel admin
 * Incluye menú hamburguesa, título y acciones del usuario
 */
export default function AdminNavbar({ onMenuClick }) {
  const { user, userRole } = useAuth();

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-blue-100 text-blue-800",
      docente: "bg-green-100 text-green-800",
      vigilante: "bg-purple-100 text-purple-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-8">
        {/* Left: Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
            title="Abrir/Cerrar menú"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.nombre}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                  {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                </span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
