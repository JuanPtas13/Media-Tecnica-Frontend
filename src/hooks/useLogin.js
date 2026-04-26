import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import { getRoleFromToken } from "../utils/jwt";

/**
 * Hook para manejar el login del usuario
 * Integra con AuthContext para actualizar el estado de autenticación
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const handleLogin = async (email, contraseña) => {
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, contraseña);

      // Validar que la respuesta tenga los datos necesarios
      if (!response.access_token) {
        throw new Error("Respuesta inválida del servidor: falta access_token");
      }

      if (!response.user) {
        throw new Error("Respuesta inválida del servidor: falta user");
      }

      // Guardar en el contexto (que a su vez guarda en localStorage)
      // Esto asegura que el AuthContext esté sincronizado
      setAuthToken(response.access_token, response.user);

      // Obtener el rol del token para la redirección
      const rol = getRoleFromToken(response.access_token) || response.user.rol;

      // Mapeo de roles a rutas
      const pathMap = {
        admin: "/admin",
        docente: "/docente",
        vigilante: "/vigilante",
        estudiante: "/estudiante",
      };

      // Redirigir según rol
      const redirectPath = pathMap[rol] || "/";
      navigate(redirectPath);

      return response;
    } catch (err) {
      const errorMessage = err.message || "Credenciales incorrectas";
      setError(errorMessage);
      console.error("Error en login:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleLogin,
    clearError: () => setError(""),
  };
}
