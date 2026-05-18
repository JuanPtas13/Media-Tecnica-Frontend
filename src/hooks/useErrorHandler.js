import { useCallback } from "react";
import { showToast } from "../utils/toast";

/**
 * Hook para manejar errores de API con notificaciones
 */
export function useErrorHandler() {
  const handleError = useCallback((error, fallbackMessage = "Error desconocido") => {
    console.error("Error capturado:", error);

    let message = fallbackMessage;

    // Manejo de diferentes tipos de error
    if (error?.message) {
      message = error.message;
    } else if (error?.detail) {
      message = error.detail;
    } else if (typeof error === "string") {
      message = error;
    }

    // Mostrar toast con error
    showToast(message, "error");

    return message;
  }, []);

  const handleApiError = useCallback((error, operation = "Operación") => {
    console.error("Error API:", error);

    let message = `${operation} fallida`;

    if (error?.status === 401) {
      message = "Sesión expirada. Por favor, inicia sesión nuevamente";
    } else if (error?.status === 403) {
      message = "No tienes permiso para realizar esta acción";
    } else if (error?.status === 404) {
      message = "Recurso no encontrado";
    } else if (error?.status === 409) {
      message = "Conflicto: El recurso ya existe o hay un conflicto";
    } else if (error?.status === 500) {
      message = "Error del servidor. Por favor, intenta más tarde";
    } else if (error?.message) {
      message = error.message;
    } else if (error?.detail) {
      message = error.detail;
    }

    showToast(message, "error");
    return message;
  }, []);

  const handleSuccess = useCallback((message = "Operación completada") => {
    showToast(message, "success");
  }, []);

  const handleWarning = useCallback((message = "Advertencia") => {
    showToast(message, "warning");
  }, []);

  return {
    handleError,
    handleApiError,
    handleSuccess,
    handleWarning,
  };
}
