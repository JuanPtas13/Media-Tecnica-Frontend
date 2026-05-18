import { apiCall } from "./api";

const ENDPOINT = "/configuracion-horaria";

export const configuracionService = {
  // Listar toda la configuración horaria
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Obtener configuración vigente
  getVigente: async () => {
    return apiCall(`${ENDPOINT}/vigente`, { method: "GET" });
  },

  // Crear configuración
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Actualizar configuración
  update: async (config_id, data) => {
    return apiCall(`${ENDPOINT}/${config_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar configuración
  delete: async (data) => {
    return apiCall(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
