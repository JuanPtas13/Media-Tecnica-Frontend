import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isTokenExpired } from "../utils/jwt";

/**
 * Componente que protege rutas verificando:
 * 1. Si el usuario está autenticado (tiene token válido)
 * 2. Si el token no ha expirado
 * 3. Si el rol del usuario coincide con el requerido
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si está autorizado
 * @param {string|string[]} props.requiredRole - Rol(es) permitido(s), ej: 'admin' o ['admin', 'docente']
 * @param {boolean} props.showAccessDenied - Si redirigir a /access-denied en lugar de /login
 */
export default function ProtectedRoute({
  children,
  requiredRole = null,
  showAccessDenied = false,
}) {
  const { isAuthenticated, token, userRole, loading } = useAuth();

  // Mientras está cargando la autenticación, mostrar un loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  // 1. Verificar si el usuario está autenticado
  if (!isAuthenticated || !token) {
    console.warn("Acceso denegado: usuario no autenticado");
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar si el token ha expirado
  if (isTokenExpired(token)) {
    console.warn("Acceso denegado: token expirado");
    return <Navigate to="/login" replace />;
  }

  // 3. Verificar rol (si es requerido)
  if (requiredRole) {
    // requiredRole puede ser un string o un array de strings
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `Acceso denegado: rol '${userRole}' no está en ${allowedRoles.join(", ")}`
      );

      // Redirigir a /access-denied si showAccessDenied es true, sino a /login
      return (
        <Navigate
          to={showAccessDenied ? "/access-denied" : "/login"}
          replace
        />
      );
    }
  }

  // Usuario autenticado, token válido y rol correcto - permitir acceso
  return children;
}
