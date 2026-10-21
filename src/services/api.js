// Centraliza la URL del backend; VITE_API_BASE_URL se define en el .env del frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Envía las credenciales al endpoint público y convierte errores HTTP en mensajes útiles.
export const loginUser = async (email, contraseña) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        contraseña,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Credenciales incorrectas");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor");
    }
    throw error;
  }
};

// Añade el JWT almacenado a las solicitudes protegidas de la API.
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Ejecuta solicitudes autenticadas y propaga el detalle HTTP para que la pantalla lo maneje.
export const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    const requestError = new Error(error.detail || "Error en la solicitud");
    requestError.status = response.status;
    throw requestError;
  }

  return await response.json();
};
