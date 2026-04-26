import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  isValidToken,
  isTokenExpired,
  getRoleFromToken,
  getTokenTimeRemaining,
} from "../utils/jwt";

const AuthContext = createContext();

/**
 * Proveedor de autenticación con validación de JWT y manejo de expiración
 * 
 * CARACTERÍSTICAS DE SEGURIDAD:
 * 1. Valida que el token no esté expirado al cargar
 * 2. Obtiene el rol del JWT en lugar de confiar solo en localStorage
 * 3. Monitorea expiración de token y hace logout automático
 * 4. Limpia datos inválidos del localStorage
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Función para hacer logout (centralizada)
  const logout = useCallback(() => {
    console.log("Logout ejecutado");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setUserRole(null);
  }, []);

  // Cargar y validar datos del localStorage al iniciar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // Validar que existan ambos datos
      if (!storedToken || !storedUser || storedUser === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }

      // Validar que el token no esté expirado
      if (isTokenExpired(storedToken)) {
        console.warn("Token expirado al cargar la aplicación");
        logout();
        setLoading(false);
        return;
      }

      // Token es válido, establecer estado
      const role = getRoleFromToken(storedToken);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setUserRole(role);

      console.log("Autenticación restaurada. Rol:", role);
    } catch (error) {
      console.error("Error al cargar datos de autenticación:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Monitorear expiración del token mientras el usuario navega
  useEffect(() => {
    if (!token) return;

    // Calcular tiempo hasta expiración
    const timeRemaining = getTokenTimeRemaining(token);

    if (timeRemaining <= 0) {
      // Token ya expiró
      console.warn("Token expirado, haciendo logout automático");
      logout();
      return;
    }

    // Configurar alarma 1 minuto ANTES de que expire
    // (para hacer logout proactivo antes de que expire)
    const expirationBuffer = 60; // segundos
    const timeToLogout = (timeRemaining - expirationBuffer) * 1000; // convertir a ms

    if (timeToLogout <= 0) {
      // Va a expirar en menos de 1 minuto
      logout();
      return;
    }

    const timer = setTimeout(() => {
      console.warn("Token a punto de expirar, haciendo logout automático");
      logout();
    }, timeToLogout);

    return () => clearTimeout(timer);
  }, [token, logout]);

  // Función para actualizar token (útil si el servidor devuelve un nuevo token)
  const setAuthToken = useCallback((newToken, userData) => {
    if (newToken && userData) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      const role = getRoleFromToken(newToken);
      setUserRole(role);
      console.log("Token actualizado. Nuevo rol:", role);
    }
  }, []);

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = useCallback(
    (requiredRole) => {
      if (!userRole) return false;
      // Permitir verificar un rol o múltiples roles: hasRole('admin') o hasRole(['admin', 'docente'])
      return Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;
    },
    [userRole]
  );

  const value = {
    user,
    token,
    userRole,
    loading,
    isAuthenticated: !!token && !isTokenExpired(token || ""),
    logout,
    setAuthToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
